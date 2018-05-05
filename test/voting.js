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
  let ACCOUNT_REGULAR_MEMBER = accounts[3];
  let ACCOUNT_APPLIED_MEMBER = accounts[8]
  let ACCOUNT_NONE_MEMBER = accounts[9];

  it("prepare members", async function () {
    let membersContract = await Members.deployed();
    // regular member
    await membersContract.applyForMembership("John Confirmed", {from: ACCOUNT_REGULAR_MEMBER})
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: accounts[0]});
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: accounts[1]});
    await membersContract.confirmApplication(ACCOUNT_REGULAR_MEMBER, {from: accounts[2]});
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
        [accounts[0], accounts[1]], { from: ACCOUNT_NONE_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if applied member wants to create a vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [accounts[0], accounts[1]], { from: ACCOUNT_APPLIED_MEMBER });
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
        [accounts[0], accounts[1]]);
    }).then(function(newId) {
      assert.equal(newId.toNumber(), 0, "Wrong id of new vote");
    }).then(function() {
      return votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [accounts[0], accounts[1]]);
    }).then(function(res) {
      assert(true, "Transaction failed initiating board member vote");
    })
  });

  it("only regular member can create a board member vote", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [accounts[0], accounts[1]], { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(newId) {
      assert.equal(newId.toNumber(), 1, "Wrong id of new vote");
    }).then(function() {
      return votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH,
        [accounts[0], accounts[1]], { from: ACCOUNT_REGULAR_MEMBER });
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
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if non-member casts vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.castVote(1, false, { from: ACCOUNT_NONE_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should throw if applied member casts vote", function() {
    return Voting.deployed().then(function(instance) {
      return instance.castVote(1, false, { from: ACCOUNT_APPLIED_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("board member can vote only once", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.castVote(1, true);
    }).then(function() {
      return votingContract.castVote(1, false);
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("regular member can vote only once", function() {
    let votingContract;
    return Voting.deployed().then(function(instance) {
      votingContract = instance;
      return votingContract.castVote(0, true, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function() {
      return votingContract.castVote(0, false, { from: ACCOUNT_REGULAR_MEMBER });
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
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
      assert.equal(res[3][0], accounts[0], "First board member address wrong.");
      assert.equal(res[3][1], accounts[1], "Second board member address wrong.");
      assert.equal(res[4].length, 1, "One voter should be available.");
      assert.equal(res[4][0], accounts[3], "Address of voter wrong.");
    }).catch(function(err) {
      assertException(err);
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
    }).catch(function(err) {
      assertException(err);
    })
  });
});
