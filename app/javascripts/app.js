// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import members_artifacts from '../../build/contracts/Members.json'

var Members = contract(members_artifacts);

var account;

var statusNames = {
  0: 'Not a member nor applied',
  1: 'Applied for Membership',
  2: 'Normal Member',
  3: 'Board Member'
};

window.App = {
  start: function() {
    var self = this;

    Members.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      account = accs[0];

      self.refreshMembers();
    });

    Members.deployed().then(function(membersContract) {
      membersContract.members.call(account).then(function (res) {
        if (res[0] !== undefined && res[0] !== "") {
          document.getElementById("name").value = res[0];
        }
        document.getElementById("currentStatus").innerHTML = statusNames[res[1]];
      });
    });
  },


  refreshMembers: function() {
    var self = this;

    var membersContract;
    Members.deployed().then(function(instance) {
      membersContract = instance;
      return membersContract.getNumberOfMembers.call();
    }).then(function(numberOfMembers) {
      document.getElementById("memberCount").innerHTML = numberOfMembers;
      for (var i = 0; i < numberOfMembers; i++) {
        membersContract.memberAddresses.call(i).then(function (res) {
          var memberAddress = res;
          membersContract.members.call(memberAddress).then(function (res) {
            var tableElement = document.createElement("tr");
            tableElement.innerHTML = "<td>" + res[0] + "</td><td>" + memberAddress + "</td><td>" 
              + statusNames[new Number(res[1])] + "</td><td>" 
              + ((res[1] == 1) ? "<button type=\"button\" value=\"Confirm\" onclick=\"App.confirmApplication('" + memberAddress + "')\">Confirm</button>" : "")
              + "</td>";
            document.getElementById("memberElements").appendChild(tableElement);
          });
        });
        
      }

    }).catch(function(e) {
      console.log(e);
    });
  },

  submitApplication: function() {
    Members.deployed().then(function(membersContract) {
      return membersContract.applyForMembership(document.getElementById("name").value, {from: account});
    }).then(function(res) {
      console.log("Applied");
      location.reload();
    }).catch(function(err) {
      console.log("Error during application: " + err);
    });
  },

  confirmApplication: function(applicantAddress) {
    Members.deployed().then(function(membersContract) {
      return membersContract.confirmApplication(applicantAddress, {from: account});
    }).then(function (res) {
      console.log("Confirmed");
      location.reload();
    }).catch(function(err) {
      console.log("Error during confirmation: " + err);
    });
  },

  changeName: function() {
    Members.deployed().then(function(membersContract) {
      return membersContract.changeName(document.getElementById("name").value, {from: account});
    }).then(function (res) {
      console.log("Name changed");
      location.reload();
    }).catch(function(err) {
      console.log("Error during name change: " + err);
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
