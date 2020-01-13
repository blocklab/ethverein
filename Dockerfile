# base image
FROM node:8.11-alpine

RUN apk update
RUN apk upgrade 
RUN apk add --no-cache bash git openssh
RUN apk add --update python krb5 krb5-libs gcc make g++ krb5-dev

# set path for global dependencies in non-root user directory
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# set working directory
WORKDIR /ethverein

# add `/app/node_modules/.bin` to $PATH
ENV PATH /ethverein/node_modules/.bin:$PATH

# expose port 
EXPOSE 4200

# install and cache app dependencies
COPY package.json .

# install global dependencies
RUN npm install -g node-gyp
#RUN npm install -g ganache-cli --unsafe-perm
RUN npm install -g web3-eth-accounts@1.0.0-beta.37 --unsafe-perm --allow-root

# Expand node RAM
CMD node --max_old_space_size=4096

# install dependencies
RUN npm install

# add app
COPY . /ethverein

# start app
CMD ng serve --host 0.0.0.0 --configuration=hmr 