var fs = require('fs');

var ignore_patterns = ['loop','ram'];

function should_skip(disk) {
  var skip = false;
  ignore_patterns.forEach(function (p) {
    if ( disk.indexOf(p) === 0 )
      skip = true;
  });
  return skip;
}

function setup(config) {
  if ( config.ignore_patterns instanceof Array ) {
    ignore_patterns = config.ignore_patterns;
  }
}

function hasPlugin() {
  var datapoints = [];

  try {
    fs.readFileSync('/proc/diskstats', 'utf8')
      .split('\n')
      .slice(2,-1)
      .forEach(function (e) {
        var skip = false;
        var disk = e.replace(/^\s+/g,'').split(/:*\s+/)[2];
        if ( should_skip(disk) === false ) {
          datapoints.push(disk + '.iops');
          datapoints.push(disk + '.merges');
          datapoints.push(disk + '.sectors');
          datapoints.push(disk + '.iotime');
          datapoints.push(disk + '.weighted');
          datapoints.push(disk + '.active');
        }
      }
    );
  }
  catch (err) {
    datapoints = false;
  }

  return datapoints;
}

function runPlugin(ret) {
  fs.readFile('/proc/diskstats', 'utf8', function (err, data) {
    if ( err ) throw err;

    var d = data.split('\n').slice(2,-1).forEach(function (e) {
      var cur = e.replace(/^\s+/g,'').split(/:*\s+/);

      if ( should_skip(cur[2]) === false ) {
        ret('diskstats.' + cur[2] + '.iops', {
          time : new Date().getTime(),
          type : 'counter',
          data : {
            reads  : cur[3],
            writes : cur[5]
          }
        });
        ret('diskstats.' + cur[2] + '.merges', {
          time : new Date().getTime(),
          type : 'counter',
          data : {
            reads  : cur[4],
            writes : cur[8]
          }
        });
        ret('diskstats.' + cur[2] + '.sectors', {
          time : new Date().getTime(),
          type : 'counter',
          data : {
            read    : cur[5],
            written : cur[9]
          }
        });
        ret('diskstats.' + cur[2] + '.iotime', {
          time : new Date().getTime(),
          type : 'counter',
          data : {
            ms_read  : cur[6],
            ms_write : cur[10]
          }
        });
        ret('diskstats.' + cur[2] + '.weighted', {
          time : new Date().getTime(),
          type : 'counter',
          data : {
            iop_time  : cur[13]
          }
        });
        ret('diskstats.' + cur[2] + '.active', {
          time : new Date().getTime(),
          type : 'gauge',
          data : {
            iops  : cur[11]
          }
        });
      }
    })
  });
}

module.exports = {
  test : hasPlugin,
  run  : runPlugin,
  setup: setup
};
