var fs = require('fs');

function hasPlugin() {
  var datapoints = [];

  try {
    fs.readFileSync('/proc/net/dev', 'utf8')
      .split('\n')
      .slice(2,-1)
      .forEach(function (e) {
        var netif = e.split(/:*\s+/)[1];
        datapoints.push(netif + '.bytes');
        datapoints.push(netif + '.packets');
        datapoints.push(netif + '.errs');
        datapoints.push(netif + '.drop');
        datapoints.push(netif + '.fifo');
        datapoints.push(netif + '.compressed');
      }
    );
  }
  catch (err) {
    datapoints = false;
  }

  return datapoints;
}

function runPlugin(ret) {
  fs.readFile('/proc/net/dev', 'utf8', function (err, data) {
    if ( err ) throw err;

    var d = data.split('\n').slice(2,-1).forEach(function (e) {
      var cur = e.split(/:*\s+/);

      ret('net.' + cur[1] + '.bytes', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[2],
          tx : cur[10]
        }
      });
      ret('net.' + cur[1] + '.packets', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[3],
          tx : cur[11]
        }
      });
      ret('net.' + cur[1] + '.errs', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[4],
          tx : cur[12]
        }
      });
      ret('net.' + cur[1] + '.drop', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[5],
          tx : cur[13]
        }
      });
      ret('net.' + cur[1] + '.fifo', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[6],
          tx : cur[14]
        }
      });
      ret('net.' + cur[1] + '.compressed', {
        time : new Date().getTime(),
        type : 'counter',
        data : {
          rx : cur[8],
          tx : cur[16]
        }
      });
    })
  });
}

module.exports = {
  test : hasPlugin,
  run  : runPlugin
};
