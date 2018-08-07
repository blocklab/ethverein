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
        CLOSED
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
    }

    Vote[] private votes;

    modifier onlyMember {
        require(membersContract.isRegularOrBoardMember(msg.sender));
        _;
    }

    modifier onlyOpenVote(uint voteId) {
        require(votes[voteId].status == VoteStatus.OPEN);
        _;
    }

    modifier onlyClosedVote(uint voteId) {
        require(votes[voteId].status == VoteStatus.CLOSED);
        _;
    }

    // Instantiate voting contract with members contract address
    constructor(address membersContractAddress) public {
        membersContract = Members(membersContractAddress); 
    }

    function initiateBoardMemberVote(string name, bytes32 documentHash, address[] newBoardMembers) public onlyMember returns (uint) {
        if (newBoardMembers.length == 0) {
            revert();
        }

        votes.push(Vote(
            { name: name,
            voteType: VoteType.BOARD_MEMBER,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: newBoardMembers,
            newVotingContractAddress: address(0),
            voters: new address[](0)}));

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
            voters: new address[](0)}));

        uint  voteId = votes.length - 1;
        emit VoteCreated(voteId, uint(VoteType.DOCUMENT));
        return voteId;
    }

    // create a contract update vote
    function initiateVotingContractUpdateVote(string name, address newContractAddress) public onlyMember returns (uint) {
        if (newContractAddress == address(0)) {
            revert();
        }
        
        votes.push(Vote(
            { name: name,
            voteType: VoteType.VOTING_CONTRACT_UPDATE,
            documentHash: 0,
            status: VoteStatus.OPEN,
            newBoardMembers: new address[](0),
            newVotingContractAddress: newContractAddress,
            voters: new address[](0)}));

        uint  voteId = votes.length - 1;
        emit VoteCreated(voteId, uint(VoteType.VOTING_CONTRACT_UPDATE));
        return voteId;
    }

    function castVote(uint voteId, bool decision) public onlyMember onlyOpenVote(voteId) {
        Vote storage vote = votes[voteId];
        require(vote.outcome[msg.sender] == VoteOutcome.NONE);
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
    function getVoteDetails(uint voteId) public view returns (string, uint, bytes32, uint, address[], address, address[]) {
        Vote storage vote = votes[voteId];
        return (vote.name, 
            uint(vote.voteType),
            vote.documentHash,
            uint(vote.status),
            vote.newBoardMembers,
            vote.newVotingContractAddress,
            vote.voters);
    }

    /**
     * Closes vote (if result exists)
     */
    function closeVote(uint voteId) public onlyMember onlyOpenVote(voteId) { 
        Vote storage vote = votes[voteId];
        VoteOutcome outcome = computeVoteOutcome(vote);

        // only close vote if result exists
        if (outcome == VoteOutcome.NONE) {
            revert();
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
}
