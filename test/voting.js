var Members = artifacts.require("./Members.sol");
var Voting = artifacts.require("./Voting.sol");
const keccak_256 = require('js-sha3').keccak_256;
// needed for async/await stuff
require("babel-polyfill");

let STATUS_APPLIED = 1;
let STATUS_REGULAR = 2;
let BOARD_MEMBER_VOTE_NAME = "New board members";
let BOARD_MEMBER_VOTE_HASH = "0x" + keccak_256("abcdefghijklmnopqrstuvwxyz");
let DOCUMENT_VOTE_NAME = "Any document vote";
let DOCUMENT_VOTE_HASH = "0x" + keccak_256("xxyyzz");

let assertException = function(error) {
  if (error.toString().indexOf("VM Exception") == -1) {
    assert(false, error.toString());
  }
}

contract('Voting', function(accounts) {
  let ACCOUNT_FIRST_BOARD_MEMBER = accounts[0];
  let ACCOUNT_SECOND_BOARD_MEMBER = accounts[1];
  let ACCOUNT_THIRD_BOARD_MEMBER = accounts[2];
  let ACCOUNT_REGULAR_MEMBER = accounts[3];
  let ACCOUNT_APPLIED_MEMBER = accounts[8]
  let ACCOUNT_NONE_MEMBER = accounts[9];

  it("prepare members", async function () {
    let membersContract = await Members.deployed();
    // regular member
    await membersContract.applyForMembership("John Confirmed", {from: ACCOUNT_REGULAR_MEMBER})
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: ACCOUNT_FIRST_BOARD_MEMBER});
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: ACCOUNT_SECOND_BOARD_MEMBER});
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: ACCOUNT_THIRD_BOARD_MEMBER});
    let afterThirdConfirmation = await membersContract.members.call(ACCOUNT_REGULAR_MEMBER);
    assert.equal(afterThirdConfirmation[1], STATUS_REGULAR, "Wrong status for confirmed member");
    // applied member
    await membersContract.applyForMembership("Thomas Applicant", {from: ACCOUNT_APPLIED_MEMBER})
    let appliedMember = await membersContract.members.call(ACCOUNT_APPLIED_MEMBER);
    assert.equal(appliedMember[1], STATUS_APPLIED, "Wrong status for applied member");
  });

  it("should throw if non-member wants to create a vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_NONE_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if applied member wants to create a vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_APPLIED_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("board member can create a vote", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      // first execute a call (non-persisting) to check the return value
      return votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    }).then(function(newId) {
      assert.equal(newId.toNumber(), 0, "Wrong id of new vote");
    }).then(function() {
      return votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    }).then(function(res) {
      assert(true, "Transaction failed initiating board member vote");
    })
  });

  it("only regular member can create a board member vote", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(newId) {
      assert.equal(newId.toNumber(), 1, "Wrong id of new vote");
    }).then(function() {
      return votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      assert(true, "Transaction failed initiating board member vote");
    })
  });

  it("only regular member can create a regular vote", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH,
        { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(newId) {
      assert.equal(newId.toNumber(), 2, "Wrong id of new vote");
    }).then(function() {
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, 
        { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      assert(true, "Transaction failed initiating board member vote");
    })
  });

  it("should return correct number of votes", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.getNumberOfVotes.call();
    }).then(function(numVotes) {
      assert.equal(numVotes, 3, "Wrong number of votes");
    })
  });

  it("should throw if member casts vote for non-existing vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.castVote(100, false);
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if non-member casts vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.castVote(1, false, { from: ACCOUNT_NONE_MEMBER });
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if applied member casts vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.castVote(1, false, { from: ACCOUNT_APPLIED_MEMBER });
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("Should throw if board member tries to vote twice", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.castVote(1, true);
    }).then(function() {
      return votingContract.castVote(1, false);
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    });
  });

  it("should throw if regular member tries to vote twice", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.castVote(0, true, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.castVote(0, false, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    });
  });

  it("vote details of board member vote are given correctly", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.getVoteDetails(0);
    }).then(function(res) {
      assert.equal(res[0], BOARD_MEMBER_VOTE_NAME, "Name of vote does not match.");
      assert.equal(res[1], BOARD_MEMBER_VOTE_HASH, "Document hash does not match.");
      assert.equal(res[2], 1, "Vote status should be OPEN");
      assert.equal(res[3].length, 2, "Two new board member addresses should be available.");
      assert.equal(res[3][0], ACCOUNT_FIRST_BOARD_MEMBER, "First board member address wrong.");
      assert.equal(res[3][1], ACCOUNT_SECOND_BOARD_MEMBER, "Second board member address wrong.");
      assert.equal(res[4].length, 1, "One voter should be available.");
      assert.equal(res[4][0], ACCOUNT_REGULAR_MEMBER, "Address of voter wrong.");
    })
  });

  it("vote details of document vote are given correctly", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.getVoteDetails(2);
    }).then(function(res) {
      assert.equal(res[0], DOCUMENT_VOTE_NAME, "Name of vote does not match.");
      assert.equal(res[1], DOCUMENT_VOTE_HASH, "Document hash does not match.");
      assert.equal(res[2], 1, "Vote should be OPEN.");
      assert.equal(res[3].length, 0, "No board member address should be set for document vote.");
      assert.equal(res[4].length, 0, "Noone should have voted yet.");
    })
  });

  it("should throw if non member can close a vote", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.closeVote.call(voteId, { from: ACCOUNT_NONE_MEMBER });
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    });
  });
  
  it("should throw if applied member can close a vote", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.closeVote.call(voteId, { from: ACCOUNT_APPLIED_MEMBER });
    }).then(function() {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    });
  });

  it("A vote that is not decided yet should have outcome NONE.", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.computeVoteOutcome.call(voteId).then(function(voteOutcome) {
        assert.equal(voteOutcome, 0, "Vote outcome should be NONE");
      });
    });
  });

  it("A vote that is not decided yet should have outcome NONE [v2, nested - to discuss].", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER }).then(function(res) {
        voteId = res;
        return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
          return votingContract.computeVoteOutcome.call(voteId).then(function(voteOutcome) {
            assert.equal(voteOutcome, 0, "Vote outcome should be NONE");
            console.log("v2 - to discuss");
          });
        });
      });
    });
  });

  it("A vote that is not decided yet should have outcome NONE [v3, no returns - to discuss].", function() {
    let votingContract;
    let voteId;
    Voting.deployed().then(function(instance) {
      votingContract = instance;
      votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER }).then(function(res) {
        voteId = res;
        votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
          votingContract.computeVoteOutcome.call(voteId).then(function(voteOutcome) {
            assert.equal(voteOutcome, 0, "Vote outcome should be NONE");
            console.log("v3 - to discuss");
          });
        });
      });
    });
  });

  it("A vote with outcome NONE should not be closed.", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.getVoteDetails(voteId);
    }).then(function(vote) {
      assert.equal(vote[2], 1, "Vote should not be closed when it has no outcome yet.");
    });
  });

  it("A vote with >50% YES votes should have outcome YES", function() {
    let votingContract;
    let membersContract; // used during development to test number of members; to be deleted.
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return Members.deployed().then(function(instance) {
        membersContract = instance;
        return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function(res) {
        // create a new vote
        voteId = res;
        return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function() {
        // vote 3x YES
        return votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
          return votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER }).then(function() {
            return votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
          });
        });
      }).then(function() {
        // collect vote outcome
        return votingContract.computeVoteOutcome.call(voteId, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function(voteOutcome) {
        assert.equal(voteOutcome, 1, "Vote outcome should be YES.");
      });
    });
  });

  it("A vote with outcome YES should be closed.", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      // create a new vote
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      // vote 3x YES
      return votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
        return votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER }).then(function() {
          return votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
        });
      });
    }).then(function() {
      // close vote
      return votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.getVoteDetails(voteId);
    }).then(function(vote) {
      assert.equal(vote[2], 2, "Vote should be closed when it has outcome YES.");
    });
  }); 

  it("A vote with <=50% NO votes should have outcome NO", function() {
    let votingContract;
    let membersContract; // used during development to test number of members; to be deleted.
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return Members.deployed().then(function(instance) {
        membersContract = instance;
        return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function(res) {
        // create a new vote
        voteId = res;
        return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function() {
        // vote 2x NO and 2x YES
        return votingContract.castVote(voteId, false, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
          return votingContract.castVote(voteId, false, { from: ACCOUNT_FIRST_BOARD_MEMBER }).then(function() {
            return votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER }).then(function() {
              return votingContract.castVote(voteId, true, { from: ACCOUNT_THIRD_BOARD_MEMBER });
            });
          });
        });
      }).then(function() {
        // collect vote outcome
        return votingContract.computeVoteOutcome.call(voteId, { from: ACCOUNT_REGULAR_MEMBER });
      }).then(function(voteOutcome) {
        assert.equal(voteOutcome, 2, "Vote outcome should be NO.");
      });
    });
  });

  it("A vote with outcome NO should be closed.", function() {
    let votingContract;
    let voteId;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      // create a new vote
      voteId = res;
      return votingContract.initiateVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      // vote 2x NO and 2x YES
      return votingContract.castVote(voteId, false, { from: ACCOUNT_REGULAR_MEMBER }).then(function() {
        return votingContract.castVote(voteId, false, { from: ACCOUNT_FIRST_BOARD_MEMBER }).then(function() {
          return votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER }).then(function() {
            return votingContract.castVote(voteId, true, { from: ACCOUNT_THIRD_BOARD_MEMBER });
          });
        });
      });
    }).then(function() {
      // close vote
      return votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.getVoteDetails(voteId);
    }).then(function(vote) {
      assert.equal(vote[2], 2, "Vote should be closed when it has outcome NO.");
    });
  }); 



// board members have been replaced

});
