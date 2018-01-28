# blockLAB member management prototype
## Setup
`npm i`

## Run Scenario
### Start Truffle develop and deploy contract
`truffle develop` takes you to Truffle dev cli (should always generate the same accounts) - notice the account addresses and private keys (always the same for develop network)
`migrate --reset` deploys/replaces the smart contract -> first 3 accounts are used for initializing the contract, those accounts are the "founders" with board member status

### Start web app in second terminal session
`npm run dev` to start the web app -> load the app in Chrome with MetaMask using `http://localhost:8081/`
Configure the custom RPC `http://localhost:9545` as well as some of the test accounts in MetaMask and have fun