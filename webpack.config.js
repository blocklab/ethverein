var path = require('path');


module.exports = {
      node: {
            crypto: true,
            http: true,
            https: true,
            os: true,
            vm: true,
            stream: true,
      },
      devServer: {
            hot: true,
            watchOptions: {
                  aggregateTimeout: 500, // delay before reloading
                  poll: 1000 // enable polling since fsevents are not supported in docker
            } 
      },

}
