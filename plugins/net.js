var fs          = require('fs')
  , pupilPlugin = require('../lib/pupilplugin')
  , net         = new pupilPlugin()

net.prototype.test = function () {
  var datapoints = [];

  try {
    var ifs = fs.readFileSync('/proc/net/dev', 'utf8')
                .split('\n')
                .slice(2,-1);
    for (var i = 0; i < ifs.length; i++) {
      var netif = ifs[i].replace(/^\s+/g,'')
                        .split(/:*\s+/)[0];

      datapoints.push(netif + '.bytes');
      datapoints.push(netif + '.packets');
      datapoints.push(netif + '.errs');
      datapoints.push(netif + '.drop');
      datapoints.push(netif + '.fifo');
      datapoints.push(netif + '.compressed');
    }
  }
  catch (err) {
    datapoints = false;
  }

  return datapoints;
};

net.prototype.run = function (ret) {
  fs.readFile('/proc/net/dev', 'utf8', function (err, data) {
    if ( err ) throw err;

    var d = data.split('\n')
                .slice(2,-1);

    for (var i = 0; i < d.length; i++) {
      var cur = d[i].replace(/^\s+/g,'')
                    .split(/:*\s+/);

      ret('net.' + cur[0] + '.bytes', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[1],
          tx : cur[9]
        }
      });
      ret('net.' + cur[0] + '.packets', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[2],
          tx : cur[10]
        }
      });
      ret('net.' + cur[0] + '.errs', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[3],
          tx : cur[11]
        }
      });
      ret('net.' + cur[0] + '.drop', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[4],
          tx : cur[12]
        }
      });
      ret('net.' + cur[0] + '.fifo', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[5],
          tx : cur[13]
        }
      });
      ret('net.' + cur[0] + '.compressed', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[7],
          tx : cur[15]
        }
      });
    }
  });
};

module.exports = new net();
