pragma solidity 0.4.23;
import "./Members.sol";

contract Voting {

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

    struct Vote {
        string name;
        bytes32 documentHash;
        VoteStatus status;
        address[] newBoardMembers;
        mapping (address => VoteOutcome) outcome;
        address[] voters;
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
        votes.push(Vote(
            { name: name,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: newBoardMembers,
            voters: new address[](0)}));

        return votes.length - 1;
    }

    // create a "regular" vote (i.e., a vote in which there are no new board members)
    function initiateVote(string name, bytes32 documentHash) public onlyMember returns (uint) {
        votes.push(Vote(
            { name: name,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: new address[](0),
            voters: new address[](0)}));

        return votes.length - 1;
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
    }

    function getNumberOfVotes() public view returns (uint) {
        return votes.length;
    }

    /**
     * Returns vote details:
     *   name
     *   documentHash
     *   status (0: NONE, 1: OPEN, 2: CLOSED)
     *   board member addresses (if board member vote)
     *   address of voters
     */
    function getVoteDetails(uint voteId) public view returns (string, bytes32, uint, address[], address[]) {
        Vote storage vote = votes[voteId];
        //bool voteStatus = vote.status == VoteStatus.OPEN ? true : false;
        return (vote.name, vote.documentHash, uint(vote.status), vote.newBoardMembers, vote.voters);
    }

    /**
     * Closes vote (if result exists)
     * TODO: Tests
     */
    function closeVote(uint voteId) public onlyMember onlyOpenVote(voteId) {
        Vote storage vote = votes[voteId];
        VoteOutcome outcome = computeCurrentVoteResult(vote);

        // only close vote if result exists
        if (outcome == VoteOutcome.NONE) {
            return;
        }          

        vote.status = VoteStatus.CLOSED;

        // instantiate board members in case of board member vote
        if (outcome == VoteOutcome.YES && vote.newBoardMembers.length != 0) {
            membersContract.replaceBoardMembers(vote.newBoardMembers);
        } 
    }

    /**
     * TODO: Tests
     */
    function computeCurrentVoteResult(uint voteId) public view returns (uint) {
        VoteOutcome outcome = computeCurrentVoteResult(votes[voteId]);
        return uint(outcome);
    }

    /**
     * TODO: Tests
     */
    function computeCurrentVoteResult(Vote storage vote) private view returns (VoteOutcome) {
        uint positiveVotes = 0;
        uint negativeVotes = 0;
        uint totalVotes = vote.voters.length;
        for (uint i = 0; i != totalVotes; ++i) {
            VoteOutcome outcome = vote.outcome[vote.voters[i]];
            if (outcome == VoteOutcome.YES) {
                ++positiveVotes;
            } else if (outcome == VoteOutcome.NO) {
                ++negativeVotes;
            }
        }
        if (positiveVotes + negativeVotes >= totalVotes/2) {
            if (positiveVotes > negativeVotes) {
                return VoteOutcome.YES;
            }
        }
        return VoteOutcome.NO;
    }

}
