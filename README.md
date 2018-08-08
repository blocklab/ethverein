# blockLAB

Smart contracts & UI of [blockLAB](http://site.blocklab.de/) - The first club to be managed on the blockchain.

## Prerequisites
* [MetaMask browser plugin](https://metamask.io/)
* [Vagrant](https://www.vagrantup.com/downloads.html)
* [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Installation (local)

### Vagrant setup

1. Clone repository:
```console
$ git clone https://github.com/blocklab/ethverein.git
```

2. Set up VM with vagrant. This will run bootstrap.sh and install the required build environment (e.g., node, npm, truffle, angular-cli):
```console
$ cd ethverein
$ vagrant up
```

3. Connect to VM:
```console
$ vagrant ssh
```

At the end of your session, *logout* or *exit* terminates the ssh session, and *vagrand suspend* suspends the VM to free up memory as well as forwarded ports. Ultimately, *vagrant destroy* destroys the whole thing ...

### Build and run ethverein

1. Compile, test, and run smart contracts using truffle:
```console
$ cd ethverein
$ npm install --no-bin-links 
$ cd src
$ truffle develop
$ test
$ migrate --reset
```

2. Open a new terminal, ssh into vagrant, and run angular:
```console
$ cd ethverein
$ npm rebuild node-sass
$ ng serve --host 0.0.0.0
```

3. Use your browser and connect to [http://localhost:4200](http://localhost:4200).

## Installation (Ropsten)

There are two ways to deploy the contracts to Ropsten testnet:
* Using geth/truffle.
* Using [http://remix.ethereum.org/](Remix).
Initially, we deployed the contracts through Remix. Since leaving our build environment and copying/pasting contract code is quite painfull, we will add support for geth and truffle as well.

As soon as the contract is deployed on the test net, insert the contract URL into environment.test.ts and run angular as follows:
```console
$ ng serve --configuration=test --host 0.0.0.0
```

## Further angular commands

### Development server

Run `ng s -o` to start and open dev-server

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

  
