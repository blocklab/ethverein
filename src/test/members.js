var Members = artifacts.require("./Members.sol");

require("babel-polyfill");

let STATUS_APPLIED = 1;
let STATUS_REGULAR = 2;
let STATUS_BOARD = 3;

let assertException = function(error) {
  if (error.toString().indexOf("VM Exception") == -1) {
    assert(false, error.toString());
  }
}

contract('Members', function(accounts) {

  let membersContract;

  let FIRST_FOUNDER_AND_BOARD_MEMBER = accounts[0];
  let SECOND_FOUNDER_AND_BOARD_MEMBER = accounts[1];
  let THIRD_FOUNDER_AND_BOARD_MEMBER = accounts[2];
  let APPLIED_MEMBER = accounts[3];
  let NEW_CONTRACT_ADDRESS = accounts[7];

  it("prepare members", async function() {
    membersContract = await Members.deployed();
  });
  
  it("should make first founder address to board member", async function() {
    let foundingMember = await membersContract.members.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
    assert.equal(foundingMember[0], "???", "Wrong name for founder");
    assert.equal(foundingMember[1], STATUS_BOARD, "Wrong status for founder");
    assert.isTrue(foundingMember[2] > 0, "Entry block not initialized");
  });
  
  it("should add three founders to address list", function() {
    membersContract.getNumberOfMembers.call().then(function(count) {
      assert.equal(count.toNumber(), 3, "Wrong count of members");
    });
  });

  it("should throw if founder wants to apply again", function() {
    membersContract.applyForMembership.call("Michael", {from: SECOND_FOUNDER_AND_BOARD_MEMBER}).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should allow other account to apply", async function() {
    await membersContract.applyForMembership("Michael", {from: APPLIED_MEMBER});
    let appliedMember = await membersContract.members.call(APPLIED_MEMBER)
    assert.equal(appliedMember[0], "Michael", "Wrong name for applicant");
    assert.equal(appliedMember[1], STATUS_APPLIED, "Wrong status for applicant");
    let numberOfMembers = await membersContract.getNumberOfMembers.call();
    assert.equal(numberOfMembers, 4, "Wrong count of members");
  });

  it("Number of eligible members should be board members and regular members", function() {
    membersContract.getNumberOfEligibleMembers.call().then(function(res) {
      assert.equal(res, 3, "Wrong number of eligible members");
    });
  });

  it("should take 3 founders to confirm Michael", async function() {
    // first confirmation
    await membersContract.confirmApplication(APPLIED_MEMBER, {from: FIRST_FOUNDER_AND_BOARD_MEMBER});
    let appliedMemberAfterFirstConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterFirstConfirmation[0], "Michael", "Wrong name for applicant");
    assert.equal(appliedMemberAfterFirstConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
    // second confirmation
    await membersContract.confirmApplication(APPLIED_MEMBER, {from: SECOND_FOUNDER_AND_BOARD_MEMBER});
    let appliedMemberAfterSecondConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterSecondConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
    // third confirmation
    await membersContract.confirmApplication(APPLIED_MEMBER, {from: THIRD_FOUNDER_AND_BOARD_MEMBER});
    let appliedMemberAfterThirdConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterThirdConfirmation[1], STATUS_REGULAR, "Wrong status for applicant");
    assert.isTrue(appliedMemberAfterThirdConfirmation[2] > 0, "Entry block not initialized");
  });

  it("should correctly change name of first founder", function() {
    return membersContract.changeName("Horst", {from: FIRST_FOUNDER_AND_BOARD_MEMBER}).then(function() {
      return membersContract.members.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
    }).then(function(appliedMember) {
      assert.equal(appliedMember[0], "Horst", "Wrong name for founder");
      assert.equal(appliedMember[1], STATUS_BOARD, "Wrong status for founder");
    })
  });

  it("should delete member from membership list", async function() {
    await membersContract.resignOwnMembership({from: FIRST_FOUNDER_AND_BOARD_MEMBER});
    let isStillAMember = await membersContract.isRegularOrBoardMember.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
    assert.isFalse(isStillAMember, "Should not be a member anymore");
    let numberOfMembers = await membersContract.getNumberOfMembers.call();
    assert.equal(numberOfMembers, 3, "Wrong count of members");
    let firstAddressInList = await membersContract.memberAddresses.call(0);
    assert.notEqual(firstAddressInList, FIRST_FOUNDER_AND_BOARD_MEMBER, "Address should not be in list of addresses anymore after deletion");
  });

  it("should not be able to resign if you are not a member", function() {
    membersContract.resignOwnMembership({from: FIRST_FOUNDER_AND_BOARD_MEMBER}).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("last member should not be able to resign", function() {
    return membersContract.resignOwnMembership({from: SECOND_FOUNDER_AND_BOARD_MEMBER}).then(function() {
      return membersContract.resignOwnMembership({from: THIRD_FOUNDER_AND_BOARD_MEMBER});
    }).then(function() {
      return membersContract.resignOwnMembership({from: APPLIED_MEMBER});
    }).then(function(res) {
      assert(false, "Supposed to throw - Last member resigned membership and it was not detected.");
    }).catch(function(err) {
      assertException(err);
    });
  });

  it("voting contract address can be set only once", async function() {
    try {
      await membersContract.setVotingContractAddress.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
      assert(false, "Supposed to throw - voting contract address should not be changed without a vote");
    } catch (err) {
      assertException(err);
    }
  });

  it("only defined voting contract address should be allowed to reset board members", async function() {
    try {
      await membersContract.replaceBoardMembers.call([FIRST_FOUNDER_AND_BOARD_MEMBER]);
      assert(false, "Supposed to throw - board members can only be replaced by assigned voting contract");
    } catch (err) {
      assertException(err);
    }
  });

  it("should fail of non-eligible contract updates voting contract address", async function() {
    try {
      await membersContract.updateVotingContractAddress.call(NEW_CONTRACT_ADDRESS, { from: FIRST_FOUNDER_AND_BOARD_MEMBER });
      assert(false, "Supposed to throw - only voting contract should be allowed to update the address");
    } catch (err) {
      assertException(err);
    }
  });
});
