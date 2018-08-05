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
    let applyEvent = await membersContract.applyForMembership("Michael", {from: APPLIED_MEMBER});
    assert.equal(applyEvent.logs.length, 1, "an event was triggered for apply membership");
    assert.equal(applyEvent.logs[0].event, "MemberApplied", "the event type is correct");
    assert.equal(applyEvent.logs[0].args.applicantAddress, APPLIED_MEMBER, "the address of the applicant in the event is correct");
    assert.equal(applyEvent.logs[0].args.applicantName, "Michael", "the address of the applicant in the event is correct");
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
    let confirmEvent = await membersContract.confirmApplication(APPLIED_MEMBER, {from: FIRST_FOUNDER_AND_BOARD_MEMBER});
    // verify no event is fired if not yet confirmed by all board members
    assert.equal(confirmEvent.logs.length, 0, "an event was triggered although member not confirmed");
    let appliedMemberAfterFirstConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterFirstConfirmation[0], "Michael", "Wrong name for applicant");
    assert.equal(appliedMemberAfterFirstConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
    // second confirmation
    await membersContract.confirmApplication(APPLIED_MEMBER, {from: SECOND_FOUNDER_AND_BOARD_MEMBER});
    let appliedMemberAfterSecondConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterSecondConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
    // third confirmation
    confirmEvent = await membersContract.confirmApplication(APPLIED_MEMBER, {from: THIRD_FOUNDER_AND_BOARD_MEMBER});
    assert.equal(confirmEvent.logs.length, 1, "no event was triggered for confirm membership");
    assert.equal(confirmEvent.logs[0].event, "MemberConfirmed", "the event type is correct");
    assert.equal(confirmEvent.logs[0].args.memberAddress, APPLIED_MEMBER, "the address of the member in the event is correct");
    assert.equal(confirmEvent.logs[0].args.memberName, "Michael", "the address of the member in the event is correct");
    let appliedMemberAfterThirdConfirmation = await membersContract.members.call(APPLIED_MEMBER);
    assert.equal(appliedMemberAfterThirdConfirmation[1], STATUS_REGULAR, "Wrong status for applicant");
    assert.isTrue(appliedMemberAfterThirdConfirmation[2] > 0, "Entry block not initialized");
  });

  it("should correctly change name of first founder", async function() {
    let nameChangeEvent = await membersContract.changeName("Horst", {from: FIRST_FOUNDER_AND_BOARD_MEMBER}); 
    assert.equal(nameChangeEvent.logs.length, 1, "no event was triggered for change name");
    assert.equal(nameChangeEvent.logs[0].event, "MemberNameChanged", "the event type is correct");
    assert.equal(nameChangeEvent.logs[0].args.memberAddress, FIRST_FOUNDER_AND_BOARD_MEMBER, "the address of the member in the event is correct");
    assert.equal(nameChangeEvent.logs[0].args.newMemberName, "Horst", "the new name of the member in the event is correct");
    let memberWithNewName = await membersContract.members.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
    assert.equal(memberWithNewName[0], "Horst", "Wrong name for founder");
    assert.equal(memberWithNewName[1], STATUS_BOARD, "Wrong status for founder");
  });

  it("should delete member from membership list", async function() {
    let resignEvent = await membersContract.resignOwnMembership({from: FIRST_FOUNDER_AND_BOARD_MEMBER});
    assert.equal(resignEvent.logs.length, 1, "no event was triggered for resign membership");
    assert.equal(resignEvent.logs[0].event, "MemberResigned", "the event type is correct");
    assert.equal(resignEvent.logs[0].args.memberAddress, FIRST_FOUNDER_AND_BOARD_MEMBER, "the address of the member in the event is correct");
    assert.equal(resignEvent.logs[0].args.memberName, "Horst", "the name of the member in the event is correct");
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

  it("kill can only be called by contract owner", async function() {
    try {
      await membersContract.kill({from: THIRD_FOUNDER_AND_BOARD_MEMBER});
      assert(false, "Supposed to throw - only contract owner should be able to call kill operation");
    } catch (err) {
      assertException(err);
    }
  });

  it("should fail contract operation after self-destruct", async function() {
    await membersContract.kill();
    try {
      await membersContract.members.call(FIRST_FOUNDER_AND_BOARD_MEMBER);
      assert(false, "Supposed to throw - no operation possible after kill");
    } catch (err) {
      if (err.toString().indexOf("Error: ") == -1) {
        assert(false, err.toString());
      }
    }
  });
});
