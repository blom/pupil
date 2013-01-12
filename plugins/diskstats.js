var fs          = require('fs')
  , pupilPlugin = require('../lib/pupilplugin')
  , diskstats   = new pupilPlugin()


diskstats.prototype.should_skip = function (disk) {
  for (var i = 0; i < this.ignore_patterns.length; i++) {
    if ( disk.indexOf(this.ignore_patterns[i]) === 0 )
      return true;
  }
  return false;
};

diskstats.prototype.setup = function (config) {
  if ( config.ignore_patterns instanceof Array ) {
    this.ignore_patterns = config.ignore_patterns;
  }
};

diskstats.prototype.test = function () {
  var datapoints = [];

  try {
    var disks = fs.readFileSync('/proc/diskstats', 'utf8')
                  .split('\n')
                  .slice(2,-1);

    for (var i = 0; i < disks.length; i++) {
      var disk = disks[i].replace(/^\s+/g,'').split(/:*\s+/)[2];
      if ( this.should_skip(disk) === false ) {
        datapoints.push(disk + '.iops');
        datapoints.push(disk + '.merges');
        datapoints.push(disk + '.sectors');
        datapoints.push(disk + '.iotime');
        datapoints.push(disk + '.weighted');
        datapoints.push(disk + '.active');
      }
    }
  }
  catch (err) {
    datapoints = false;
  }
  return datapoints;
};

diskstats.prototype.run = function (ret) {
  var self = this;

  fs.readFile('/proc/diskstats', 'utf8', function (err, data) {
    if ( err ) throw err;

    var disks = data.split('\n')
                .slice(2,-1);

    for (var i = 0; i < disks.length; i++) {
      var cur = disks[i].replace(/^\s+/g,'')
                        .split(/:*\s+/);

      if ( self.should_skip(cur[2]) === false ) {
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
    }
  });
};

module.exports = new diskstats();