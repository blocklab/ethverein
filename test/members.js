var Members = artifacts.require("./Members.sol");

let STATUS_APPLIED = 1;
let STATUS_REGULAR = 2;
let STATUS_BOARD = 3;

let assertException = function(error) {
  if (error.toString().indexOf("VM Exception") == -1) {
    assert(false, error.toString());
  }
}

contract('Members', function(accounts) {
  it("should make first founder address to board member", function() {
    return Members.deployed().then(function(instance) {
      return instance.members.call(accounts[0]);
    }).then(function(member) {
      assert.equal(member[0], "???", "Wrong name for founder");
      assert.equal(member[1], STATUS_BOARD, "Wrong status for founder");
    });
  });

  it("should add three founders to address list", function() {
    return Members.deployed().then(function(instance) {
      return instance.getNumberOfMembers.call();
    }).then(function(count) {
      assert.equal(count.toNumber(), 3, "Wrong count of members");
    });
  });

  it("should throw if founder wants to apply", function() {
    return Members.deployed().then(function(instance) {
      return instance.applyForMembership("Michael", {from: accounts[1]});
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("should allow other account to apply", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.applyForMembership("Michael", {from: accounts[3]});
    }).then(function() {
      return membersContract.members.call(accounts[3]);
    }).then(function(appliedMember) {
      assert.equal(appliedMember[0], "Michael", "Wrong name for applicant");
      assert.equal(appliedMember[1], STATUS_APPLIED, "Wrong status for applicant");
      return membersContract.getNumberOfMembers.call();
    }).then(function(count) {
      assert.equal(count.toNumber(), 4, "Wrong count of members");
    })
  });

  it("should take 3 founders to confirm Michael", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.confirmApplication(accounts[3], {from: accounts[0]});
    }).then(function() {
      return membersContract.members.call(accounts[3]);
    }).then(function(afterFirstConfirmation) {
      assert.equal(afterFirstConfirmation[0], "Michael", "Wrong name for applicant");
      assert.equal(afterFirstConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
      return membersContract.confirmApplication(accounts[3], {from: accounts[1]});
    }).then(function() {
      return membersContract.members.call(accounts[3]);
    }).then(function(afterSecondConfirmation) {
      assert.equal(afterSecondConfirmation[1], STATUS_APPLIED, "Wrong status for applicant");
      return membersContract.confirmApplication(accounts[3], {from: accounts[2]});
    }).then(function() {
      return membersContract.members.call(accounts[3]);
    }).then(function(afterThirdConfirmation) {
      assert.equal(afterThirdConfirmation[1], STATUS_REGULAR, "Wrong status for applicant");
    })
  });

  it("should correctly change name of first founder", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.changeName("Horst", {from: accounts[0]});
    }).then(function() {
      return membersContract.members.call(accounts[0]);
    }).then(function(appliedMember) {
      assert.equal(appliedMember[0], "Horst", "Wrong name for founder");
      assert.equal(appliedMember[1], STATUS_BOARD, "Wrong status for founder");
    })
  });
  
});
