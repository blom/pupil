var os          = require('os'),
    pupilPlugin = require('../lib/pupilplugin'),
    load        = new pupilPlugin();

load.prototype.test = function () {
  return os.loadavg ? ['average'] : false;
};

load.prototype.run = function () {
  var loadavg = os.loadavg().map(function (n) {
    return parseFloat(n.toFixed(2));
  });

  this.dispatch('average', {
    time: new Date().getTime(),
    type: 'gauge',
    draw: 'line',
    data: {
      '15min': loadavg[2],
      '5min':  loadavg[1],
      '1min':  loadavg[0]
    }
  });
};

module.exports = load;
