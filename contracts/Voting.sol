pragma solidity ^0.4.17;
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

    // Instantiate voting contract with members contract address
	function Voting(address membersContractAddress) public {
        membersContract = Members(membersContractAddress); 
    }

    function initiateBoardMemberVote(string name, bytes32 documentHash, address[] newBoardMembers) public onlyMember returns (uint) {
        address[] emptyVoters;
        votes.push(Vote({name: name, 
            documentHash: documentHash, 
            status: VoteStatus.OPEN, 
            newBoardMembers: newBoardMembers, 
            voters: emptyVoters}));

        return votes.length - 1;
    }

    function castVote(uint voteId, bool vote) public onlyMember onlyOpenVote(voteId) {
        Vote v = votes[voteId];
        require(v.outcome[msg.sender] == VoteOutcome.NONE);
        if (vote == true) {
            v.outcome[msg.sender] = VoteOutcome.YES;
        } else {
            v.outcome[msg.sender] = VoteOutcome.NO;
        }
        v.voters.push(msg.sender);
    }

// TODO:

    // getStatusOfVote()
    // closeVote()

// Overall:
    // getAllVotes()
    // getStatusOfVote()

// + tests

}