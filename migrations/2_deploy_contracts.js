var Members = artifacts.require("./Members.sol");
var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
  
  let membersContract, votingContract;
  let address1 = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
  let address2 = "0xf17f52151ebef6c7334fad080c5704d77216b732";
  let address3 = "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef";
  
  deployer.deploy(Members, [address1, address2, address3]).then(() => {
    return Members.deployed().then(members => {
      membersContract = members;
      return deployer.deploy(Voting, members.address).then(() => {
        return Voting.deployed().then(voting => {
          votingContract = voting;
          membersContract.setVotingContractAddress(votingContract.address);
        });
      });
    });
  });
}
