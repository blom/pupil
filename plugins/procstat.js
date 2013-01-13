var fs          = require('fs')
  , pupilPlugin = require('../lib/pupilplugin')
  , procstat    = new pupilPlugin()

procstat.prototype.test = function () {
  try {
    if ( fs.statSync('/proc/stat').isFile() ) {
      return ['cpu','processes','ctxt'];
    }
    else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

procstat.prototype.run = function () {
  var self = this;
  fs.readFile('/proc/stat', 'utf8', function (err, data) {
    if ( err ) throw err;

    var d = data.split('\n').forEach(function (l) {
      if ( l.match(/^cpu /) ) {
        var cpu = l.split(' ');
        self.dispatch('cpu', {
          type: 'counter',
          draw: 'stacked',
          data: {
            system : cpu[4],
            user   : cpu[2],
            nice   : cpu[3],
            idle   : cpu[5],
            iowait : cpu[6],
            irq    : cpu[7],
            softirq: cpu[8],
            steal  : cpu[9],
            guest  : cpu[10]
          }
        });
      }
      else if ( l.match(/^ctxt /) ) {
        var ctxt = l.split(' ');
        self.dispatch('ctxt', {
          type: 'counter',
          data: {
            ctxt : ctxt[1]
          }
        });
      }
      else if ( l.match(/^processes /) ) {
        var processes = l.split(' ');
        self.dispatch('processes', {
          type: 'counter',
          data: {
            processes : processes[1]
          }
        });
      }
    });

  });
}

module.exports = procstat;
