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
        votes.push(Vote({name: name,
            documentHash: documentHash,
            status: VoteStatus.OPEN,
            newBoardMembers: newBoardMembers,
            voters: new address[](0)}));

        return votes.length - 1;
    }

    function castVote(uint voteId, bool decision) public onlyMember onlyOpenVote(voteId) {
        var vote = votes[voteId];
        require(vote.outcome[msg.sender] == VoteOutcome.NONE);
        if (decision == true) {
            vote.outcome[msg.sender] = VoteOutcome.YES;
        } else {
            vote.outcome[msg.sender] = VoteOutcome.NO;
        }
        vote.voters.push(msg.sender);
    }

// TODO:

    // getStatusOfVote()
    // closeVote()

// Overall:
    // getAllVotes()
    // getStatusOfVote()

// + tests

}