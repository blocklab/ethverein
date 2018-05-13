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

  it("Number of eligible members should be board members and regular members", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.getNumberOfEligibleMembers();
    }).then(function(res) {
      assert.equal(res, 3, "Wrong number of eligible members");
    });
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

  it("should delete member from membership list", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.resignOwnMembership({from: accounts[0]});
     }).then(function() {
      return membersContract.isRegularOrBoardMember.call(accounts[0]);
    }).then(function(isStillAMember) {
      assert.isFalse(isStillAMember, "Should not be a member anymore");
      return membersContract.getNumberOfMembers.call();
    }).then(function(count) {
      assert.equal(count.toNumber(), 3, "Wrong count of members");
      return membersContract.memberAddresses.call(0);
    }).then(function(firstAddressInList) {
      assert.notEqual(firstAddressInList, accounts[0], "Address should not be in list of addresses anymore after deletion");
    })
  });

  it("should not be able to resign if you are not a member", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.resignOwnMembership({from: accounts[0]});
    }).then(function(res) {
      assert(false, "Supposed to throw");
    }).catch(function(err) {
      assertException(err);
    })
  });

  it("last member should not be able to resign", function() {
    let membersContract;
    return Members.deployed().then(function(instance) {
      membersContract = instance;
      return instance.resignOwnMembership({from: accounts[1]});
    }).then(function() {
      return membersContract.resignOwnMembership({from: accounts[2]});
    }).then(function() {
      return membersContract.resignOwnMembership({from: accounts[3]});
    }).then(function(res) {
      assert(false, "Supposed to throw - Last member resigned membership and it was not detected.");
    }).catch(function(err) {
      assertException(err);
    })
  });

});
