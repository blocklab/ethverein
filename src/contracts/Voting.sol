pragma solidity ^0.4.23;

import "./Members.sol";

contract Voting {

    event VoteCreated(uint voteId, uint voteType);
    event VoteCast(uint voteId, address voter);
    event VoteClosed(uint voteId, uint outcome);

    Members private membersContract;

    enum VoteStatus {
        NONE,
        OPEN,
        CLOSED,
        CANCELED
    }

    enum VoteOutcome {
        NONE,
        YES,
        NO
    }

    enum VoteType {
        NONE,
        DOCUMENT,
        BOARD_MEMBER,
        VOTING_CONTRACT_UPDATE
    }

    struct Vote {
        string name;
        VoteType voteType;
        bytes32 documentHash;
        VoteStatus status;
        mapping (address => VoteOutcome) outcome;
        address[] voters;
        address[] newBoardMembers;
        address newVotingContractAddress;
        address initiator;
        uint blockNumberAtInitiation;
    }

    Vote[] private votes;

    modifier onlyMember {
        require(membersContract.isRegularOrBoardMember(msg.sender), "Sender is not a member");
        _;
    }

    modifier onlyOpenVote(uint voteId) {
        require(votes[voteId].status == VoteStatus.OPEN, "Vote is not open");
        _;
    }

    modifier onlyClosedVote(uint voteId) {
        require(votes[voteId].status == VoteStatus.CLOSED, "Vote is not closed");
        _;
    }

    // Instantiate voting contract with members contract address
    constructor(address membersContractAddress) public {
        membersContract = Members(membersContractAddress); 
    }

    function initiateBoardMemberVote(string name, bytes32 documentHash, address[] newBoardMembers) public onlyMember returns (uint) {
        if (newBoardMembers.length == 0) {
            revert("List of board member addresses must not be empty");
        }

        votes.push(Vote(
            { name: name,
            voteType: VoteType.BOARD_MEMBER,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: newBoardMembers,
            newVotingContractAddress: address(0),
            voters: new address[](0),
            initiator: msg.sender,
            blockNumberAtInitiation: block.number
            }
        ));

        uint  voteId = votes.length - 1;
        emit VoteCreated(voteId, uint(VoteType.BOARD_MEMBER));
        return voteId;
    }

    // create a document vote
    function initiateDocumentVote(string name, bytes32 documentHash) public onlyMember returns (uint) {
        votes.push(Vote(
            { name: name,
            voteType: VoteType.DOCUMENT,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: new address[](0),
            newVotingContractAddress: address(0),
            voters: new address[](0),
            initiator: msg.sender,
            blockNumberAtInitiation: block.number
            }));

        uint  voteId = votes.length - 1;
        emit VoteCreated(voteId, uint(VoteType.DOCUMENT));
        return voteId;
    }

    // create a contract update vote
    function initiateVotingContractUpdateVote(string name, address newContractAddress) public onlyMember returns (uint) {
        if (newContractAddress == address(0)) {
            revert("Address of new contract must not be empty");
        }
        
        votes.push(Vote(
            { name: name,
            voteType: VoteType.VOTING_CONTRACT_UPDATE,
            documentHash: 0,
            status: VoteStatus.OPEN,
            newBoardMembers: new address[](0),
            newVotingContractAddress: newContractAddress,
            voters: new address[](0),
            initiator: msg.sender,
            blockNumberAtInitiation: block.number
            }));

        uint  voteId = votes.length - 1;
        emit VoteCreated(voteId, uint(VoteType.VOTING_CONTRACT_UPDATE));
        return voteId;
    }

    function castVote(uint voteId, bool decision) public onlyMember onlyOpenVote(voteId) {
        Vote storage vote = votes[voteId];
        require(vote.outcome[msg.sender] == VoteOutcome.NONE, "Vote outcome is already set");
        if (decision == true) {
            vote.outcome[msg.sender] = VoteOutcome.YES;
        } else {
            vote.outcome[msg.sender] = VoteOutcome.NO;
        }
        vote.voters.push(msg.sender);

        emit VoteCast(voteId, msg.sender);
    }

    function getNumberOfVotes() public view returns (uint) {
        return votes.length;
    }

    /**
     * Returns vote details:
     *   name
     *   type (0: NONE, 1: DOCUMENT, 2: BOARD_MEMBER, 3: VOTING_CONTRACT_UPDATE)
     *   documentHash (if board member vote or contract update vote)
     *   status (0: NONE, 1: OPEN, 2: CLOSED)
     *   board member addresses (if board member vote)
     *   address of new voting contract (if contract update vote)
     *   addresses of voters
     */
    function getVoteDetails(uint voteId) public view returns (string, uint, bytes32, uint, address[], address, address[], address, uint) {
        Vote storage vote = votes[voteId];
        return (vote.name, 
            uint(vote.voteType),
            vote.documentHash,
            uint(vote.status),
            vote.newBoardMembers,
            vote.newVotingContractAddress,
            vote.voters,
            vote.initiator,
            vote.blockNumberAtInitiation);
    }

    /**
     * Closes vote (if result exists)
     */
    function closeVote(uint voteId) public onlyMember onlyOpenVote(voteId) { 
        Vote storage vote = votes[voteId];
        VoteOutcome outcome = computeVoteOutcome(vote);

        // only close vote if result exists
        if (outcome == VoteOutcome.NONE) {
            revert("No vote result exists yet");
        }          

        vote.status = VoteStatus.CLOSED;

        // instantiate board members in case of board member vote
        if (outcome == VoteOutcome.YES && vote.voteType == VoteType.BOARD_MEMBER) {
            membersContract.replaceBoardMembers(vote.newBoardMembers);
        } 

        // set new contract address in case of contract address vote
        if (outcome == VoteOutcome.YES && vote.voteType == VoteType.VOTING_CONTRACT_UPDATE) {
            membersContract.updateVotingContractAddress(vote.newVotingContractAddress);
        }

        emit VoteClosed(voteId, uint(outcome));
    }

    function computeVoteOutcome(uint voteId) public view returns (uint) {
        VoteOutcome outcome = computeVoteOutcome(votes[voteId]);
        return uint(outcome);
    }

    /**
     * Eligible voters: E (i.e., regular or board members)
     * Positive votes: Y
     * Negative votes: N
     * Open votes: O
     * Y > E/2 --> Vote positive
     * N > E/2 --> Vote negative
     * Elsewise: Vote still open
     */
    function computeVoteOutcome(Vote storage vote) private view returns (VoteOutcome) {
        uint positiveVotes = 0;
        uint negativeVotes = 0;

        // count votes: iterate through all members
        for (uint i = 0; i != vote.voters.length; ++i) {
            VoteOutcome outcome = vote.outcome[vote.voters[i]];
            if (outcome == VoteOutcome.YES) {
                ++positiveVotes;
            } else if (outcome == VoteOutcome.NO) {
                ++negativeVotes;
            }
        }

        // process result
        uint eligibleVoters = membersContract.getNumberOfEligibleMembers();
        if (positiveVotes > eligibleVoters/2) {
            return VoteOutcome.YES;
        } else if (negativeVotes >= eligibleVoters/2) {
            return VoteOutcome.NO;
        } else {
            return VoteOutcome.NONE;
        }
    }

    /**
     * An initiator of a vote can cancel a vote (if it is still undecided)
     */
    function cancelVote(uint voteId) public onlyOpenVote(voteId) {

        Vote storage vote = votes[voteId];

        // check if vote is undecided
        if (computeVoteOutcome(vote) != VoteOutcome.NONE) {
            revert("Only undecided votes can be closed");
        }
        
        /**
         * Within 172800 blocks (roughly 30 days assuming a 15-second block size):
         * Only initiator should be allowed to cancel the vote.
         *
         * After 172800 blocks:
         * Every eligible member should be allowed to cancel the vote.
         */
        uint blocksPassed = block.number - vote.blockNumberAtInitiation;
        if (blocksPassed < 172800) {
            if (votes[voteId].initiator != msg.sender) {
                revert("Within 172,800 blocks, only initiator can cancel a vote");
            }
        } else {
            if (!membersContract.isRegularOrBoardMember(msg.sender)) {
                revert("After 172,800 blocks, only regular and board members can cancel a vote");
            }
        }
        
        vote.status = VoteStatus.CANCELED;
    }
}
