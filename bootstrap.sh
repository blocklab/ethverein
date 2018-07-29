#!/usr/bin/env bash

set vx

apt-get install -y git build-essential

# install node.js (currently v10.1.0)
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt-get install -y nodejs

# update npm
npm install -g npm@6.2.0

# install angular
npm install -g @angular/cli

# node-gyp
npm install -g node-gyp

# truffle
npm install -g truffle@4.1.13 

