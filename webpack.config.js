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
                  watch: true,
            } 
      },

}
