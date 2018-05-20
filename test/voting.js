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
let VOTING_CONTRACT_UPDATE_VOTE_NAME = "Contract Update Vote";

let VOTE_TYPE_DOCUMENT = 1;
let VOTE_TYPE_BOARD_MEMBER = 2;
let VOTE_TYPE_VOTING_CONTRACT_UPDATE = 3;

let VOTE_STATUS_OPEN = 1;
let VOTE_STATUS_CLOSED = 2;

let VOTE_OUTCOME_NONE = 0;
let VOTE_OUTCOME_YES = 1;
let VOTE_OUTCOME_NO = 2;

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
  let NEW_CONTRACT_ADDRESS = accounts[7];
  let ACCOUNT_APPLIED_MEMBER = accounts[8]
  let ACCOUNT_NON_MEMBER = accounts[9];

  let votingContract;
  let membersContract;

  it("prepare members", async function () {
    membersContract = await Members.deployed();
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

  it("prepare voting", async function() {
    votingContract = await Voting.deployed();
  });

  it("should throw if non-member wants to create a board member vote", async function() {
    try {
      await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_NON_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if non-member wants to create a document vote", async function() {
    try {
      await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_NON_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if non-member wants to create a contract update vote", async function() {
    try {
      await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_NON_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if applied member wants to create a board member vote", async function() {
    try {
      await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_APPLIED_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if applied member wants to create a document vote", async function() {
    try {
      await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_APPLIED_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });
  
  it("should throw if applied member wants to create a contract update vote", async function() {
    try {
      await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_APPLIED_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("board member can create a board member vote", async function() {
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_FIRST_BOARD_MEMBER });
  });

  it("board member can create a document vote", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_FIRST_BOARD_MEMBER });
  });

  it("board member can create a voting contract update vote", async function() {
    let voteId = await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_FIRST_BOARD_MEMBER });
  });

  it("regular member can create a board member vote", async function() {
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
  });

  it("regular member can create a document vote", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
  });

  it("regular member can create a voting contract update vote", async function() {
    let voteId = await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_REGULAR_MEMBER });
  });

  it("board member vote returns id with increasing number", async function() {
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER]);
    assert.equal(voteId.toNumber(), 3, "Wrong id of new vote");
  });

  it("document vote returns id with increasing number", async function() {
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    assert.equal(voteId.toNumber(), 6, "Wrong id of new vote");
  });

  it("should throw if board member vote is instantiated without new board members", async function() {
    try {
      await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [], { from: ACCOUNT_REGULAR_MEMBER });
      assert(false, "Supposed to throw");
    } catch (e) {
      assertException(e);
    }
  });

  it("should throw if voting contract update vote is instantiated without new contract address", async function() {
    try {
      await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, 0, { from: ACCOUNT_REGULAR_MEMBER });
      assert(false, "Supposed to throw");
    } catch (e) {
      assertException(e);
    }
  });

  it("should return correct number of votes", async function() {
    let numVotes = await votingContract.getNumberOfVotes.call();
    assert.equal(numVotes, 6, "Wrong number of votes");
  });

  it("should throw if member casts vote for non-existing vote", async function() {
    try {
      await votingContract.castVote.call(100, false);
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if non-member casts vote", async function() {
    try {
      await votingContract.castVote.call(1, false, { from: ACCOUNT_NON_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if applied member casts vote", async function() {
    try {
      await votingContract.castVote.call(1, false, { from: ACCOUNT_APPLIED_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("should throw if a member tries to vote twice", async function() {
    try {
      await votingContract.castVote(0, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
      await votingContract.castVote.call(0, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("vote details of board member vote are given correctly", async function() {
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_REGULAR_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_REGULAR_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    let voteDetails = await votingContract.getVoteDetails.call(voteId);
    assert.equal(voteDetails[0], BOARD_MEMBER_VOTE_NAME, "Name of vote does not match.");
    assert.equal(voteDetails[1], VOTE_TYPE_BOARD_MEMBER, "Vote type of board member vote does not match.");
    assert.equal(voteDetails[2], BOARD_MEMBER_VOTE_HASH, "Board member vote hash does not match.");
    assert.equal(voteDetails[3], VOTE_STATUS_OPEN, "Vote status should be OPEN");
    assert.equal(voteDetails[4].length, 2, "Two new board member addresses should be available.");
    assert.equal(voteDetails[4][0], ACCOUNT_FIRST_BOARD_MEMBER, "First board member address wrong.");
    assert.equal(voteDetails[4][1], ACCOUNT_REGULAR_MEMBER, "Second board member address wrong.");
    assert.equal(voteDetails[5], 0x0, "No contract update address should be set.");
    assert.equal(voteDetails[6].length, 1, "One voter should be available.");
    assert.equal(voteDetails[6][0], ACCOUNT_FIRST_BOARD_MEMBER, "Address of voter wrong.");
  });

  it("vote details of document vote are given correctly", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    let voteDetails = await votingContract.getVoteDetails.call(voteId);
    assert.equal(voteDetails[0], DOCUMENT_VOTE_NAME, "Name of vote does not match.");
    assert.equal(voteDetails[1], VOTE_TYPE_DOCUMENT, "Vote type of document vote does not match.");
    assert.equal(voteDetails[2], DOCUMENT_VOTE_HASH, "Document hash does not match.");
    assert.equal(voteDetails[3], VOTE_STATUS_OPEN, "Vote status should be OPEN");
    assert.equal(voteDetails[4].length, 0, "No board member address should be set for document vote.");
    assert.equal(voteDetails[5], 0x0, "No contract update address should be set.");
    assert.equal(voteDetails[6].length, 0, "Noone should have voted yet.");
  });

  it("vote details of contract update vote are given correctly", async function() {
    let voteId = await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateVotingContractUpdateVote(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_REGULAR_MEMBER });
    let voteDetails = await votingContract.getVoteDetails.call(voteId);
    assert.equal(voteDetails[0], VOTING_CONTRACT_UPDATE_VOTE_NAME, "Name of vote does not match.");
    assert.equal(voteDetails[1], VOTE_TYPE_VOTING_CONTRACT_UPDATE, "Vote type of voting contract update vote does not match.");
    assert.equal(voteDetails[2], 0, "Document hash should be empty.");
    assert.equal(voteDetails[3], VOTE_STATUS_OPEN, "Vote status should be OPEN");
    assert.equal(voteDetails[4].length, 0, "No board member address should be set for contract update vote.");
    assert.equal(voteDetails[5], NEW_CONTRACT_ADDRESS, "Address of new contract not set correctly.");
    assert.equal(voteDetails[6].length, 0, "Noone should have voted yet.");
  });

  it("should throw if non-member closes a vote", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    try {
      await votingContract.closeVote.call(voteId, { from: ACCOUNT_NON_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });
  
  it("should throw if non-member closes a vote", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    try {
      await votingContract.closeVote.call(voteId, { from: ACCOUNT_APPLIED_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("a vote that is not decided yet should have outcome NONE", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    let voteOutcome = await votingContract.computeVoteOutcome.call(voteId);
    assert.equal(voteOutcome, VOTE_OUTCOME_NONE, "Vote outcome should be NONE");
  });

  it("a vote with outcome NONE can not be closed", async function() {
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    try {
      await votingContract.closeVote.call(voteId, { from: ACCOUNT_REGULAR_MEMBER });
      assert(false, "Supposed to throw - Vote should not be closed when it has no outcome yet");
    } catch (err) {
      assertException(err);
    }
  });

  it("a vote with >50% YES votes should have outcome YES", async function() {
    // create a new vote
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // collect vote outcome
    let voteOutcome = await votingContract.computeVoteOutcome.call(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    assert.equal(voteOutcome, VOTE_OUTCOME_YES, "Vote outcome should be YES.");
  });

  it("a vote with outcome YES should be closed", async function() {
    // create a new vote
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES 
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // close vote
    await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    let voteDetails = await votingContract.getVoteDetails(voteId);
    assert.equal(voteDetails[3], VOTE_STATUS_CLOSED, "Vote should be closed when it has outcome YES.");
  }); 

  it("a vote with <=50% NO votes should have outcome NO", async function() {
    // create a new vote
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, false, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, false, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_THIRD_BOARD_MEMBER });
    // collect vote outcome
    let voteOutcome = await votingContract.computeVoteOutcome.call(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    assert.equal(voteOutcome, VOTE_OUTCOME_NO, "Vote outcome should be NO.");
  });


  it("a vote with outcome NO should be closed", async function() {
    // create a new vote
    let voteId = await votingContract.initiateDocumentVote.call(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateDocumentVote(DOCUMENT_VOTE_NAME, DOCUMENT_VOTE_HASH, { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES 
    await votingContract.castVote(voteId, false, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, false, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_THIRD_BOARD_MEMBER });
    // close vote
    await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    let voteDetails = await votingContract.getVoteDetails(voteId);
    assert.equal(voteDetails[3], VOTE_STATUS_CLOSED, "Vote should be closed when it has outcome NO.");
  }); 

  it("new board members should be instantiated", async function() {
    // create a new board member vote
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_REGULAR_MEMBER, ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_SECOND_BOARD_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // close vote
    await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    // check if new board members have been instatiated and third board member has been "downgraded"
    let newBoardMember = await membersContract.members.call(ACCOUNT_REGULAR_MEMBER);
    let stillBoardMember1 = await membersContract.members.call(ACCOUNT_FIRST_BOARD_MEMBER);
    let stillBoardMember2 = await membersContract.members.call(ACCOUNT_SECOND_BOARD_MEMBER);
    let notBoardMemberAnymore = await membersContract.members.call(ACCOUNT_THIRD_BOARD_MEMBER);
    assert.equal(newBoardMember[1], 3, "Should now be a board member.");
    assert.equal(stillBoardMember1[1], 3, "Should still be a board member.");
    assert.equal(stillBoardMember2[1], 3, "Should still be a board member.");
    assert.equal(notBoardMemberAnymore[1], 2, "Should not be a board member anymore.");
  }); 

  it("should throw if applied member should be instantiated as board member", async function() {
    // create a new board member vote
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_REGULAR_MEMBER, ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_APPLIED_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_REGULAR_MEMBER, ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_APPLIED_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // close vote
    try {
      await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
      assert(false, "Supposed to throw");
    } catch (e) {
      assertException(e);
    }
  });

  it("should throw if non-member should be instantiated as board member", async function() {
    // create a new board member vote
    let voteId = await votingContract.initiateBoardMemberVote.call(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_REGULAR_MEMBER, ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_NON_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateBoardMemberVote(BOARD_MEMBER_VOTE_NAME, BOARD_MEMBER_VOTE_HASH, [ACCOUNT_REGULAR_MEMBER, ACCOUNT_FIRST_BOARD_MEMBER, ACCOUNT_NON_MEMBER], { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // close vote
    try {
      await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
      assert(false, "Supposed to throw");
    } catch (err) {
      assertException(err);
    }
  });

  it("voting contract address is set correctly in members contract after voting contract update vote", async function() {
    let oldVotingContractAddressInMembersContract = await membersContract.votingContractAddress.call();
    assert.equal(votingContract.address, oldVotingContractAddressInMembersContract);
    // create a new voting contract update vote
    let voteId = await votingContract.initiateVotingContractUpdateVote.call(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.initiateVotingContractUpdateVote(VOTING_CONTRACT_UPDATE_VOTE_NAME, NEW_CONTRACT_ADDRESS, { from: ACCOUNT_REGULAR_MEMBER });
    // vote 3x YES
    await votingContract.castVote(voteId, true, { from: ACCOUNT_REGULAR_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_FIRST_BOARD_MEMBER });
    await votingContract.castVote(voteId, true, { from: ACCOUNT_SECOND_BOARD_MEMBER });
    // close vote
    await votingContract.closeVote(voteId, { from: ACCOUNT_REGULAR_MEMBER });
    // check if address is set correctly
    let newVotingContractAddressInMembersContract = await membersContract.votingContractAddress.call();
    assert.equal(newVotingContractAddressInMembersContract, NEW_CONTRACT_ADDRESS);
  });

  // test if contract address is zero; 
  




});
