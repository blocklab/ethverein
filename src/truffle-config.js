module.exports = {
  networks:{
  ganache:{
    host: '127.0.0.1',
    port: 7545,
    network_id: '5777' // Match any network id
  },
 
    dockernache:{
    host: 'ethverein_ganachecli_1',
    port: 8545,
    network_id: '*' // Match any network id
  },
  }
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
};
