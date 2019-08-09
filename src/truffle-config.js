module.exports = {
  networks:{
  ganache:{
    host: '127.0.0.1',
    port: 7545,
    network_id: '5777' // Match any network id
  },
  ropsten:  {
    network_id: 3,
    host: "127.0.0.1",
    port:  8545,
    gas:   2900000
  } 
  ,}
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
};
