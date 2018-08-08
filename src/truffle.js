// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    develop: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    ropsten:  {
      network_id: 3,
      host: "127.0.0.1",
      port:  8545,
      gas:   2900000
    } 
  }
}
