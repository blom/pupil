/*
  TODO: /proc/vmstat got a lot of counters we're not dealing with.  Feel free
        to patch the plugin if you know what to graph.
*/
var fs          = require('fs')
  , pupilPlugin = require('../lib/pupilplugin')
  , vmstat      = new pupilPlugin()

vmstat.prototype.test = function () {
  try {
    if (fs.statSync("/proc/vmstat").isFile()) {
      return ["numa",
              "pages",
              "swap",
              "pagefaults",
              "pagerefills",
              "pagesteals",
              "pageallocs",
              "pagescans_direct",
              "pagescans_kswapd"];
    }
  } catch (err) {}
  return false;
};

vmstat.prototype.run = function () {
  var self = this;
  fs.readFile("/proc/vmstat", "utf8", function (err, data) {
    if (err) throw err;
    var vmstat = {};

    data.split("\n").forEach(function (line) {
      var r = /^(\S+)\s+(\d+)/.exec(line);
      if (r instanceof Array) {
        vmstat[r[1].toLowerCase()] = r[2];
      }
    });
    self.dispatch("numa", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        hit       : vmstat.numa_hit,
        miss      : vmstat.numa_miss,
        foreign   : vmstat.numa_foreign,
        interleave: vmstat.numa_interleave,
        local     : vmstat.numa_local,
        other     : vmstat.numa_other
      }
    });
    self.dispatch("pages", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        pgpgin : vmstat.pgpgin,
        pgpgout: vmstat.pgpgout
      }
    });
    self.dispatch("swap", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        pswpin : vmstat.pswpin,
        pswpout: vmstat.pswpout
      }
    });
    self.dispatch("pagefaults", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        minor: vmstat.pgfault,
        major: vmstat.pgmajfault
      }
    });
    self.dispatch("pagerefills", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        movable: vmstat.pgrefill_movable,
        high   : vmstat.pgrefill_high,
        normal : vmstat.pgrefill_normal,
        dma32  : vmstat.pgrefill_dma32,
        dma    : vmstat.pgrefill_dma
      }
    });
    self.dispatch("pagesteals", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        movable: vmstat.pgsteal_movable,
        high   : vmstat.pgsteal_high,
        normal : vmstat.pgsteal_normal,
        dma32  : vmstat.pgsteal_dma32,
        dma    : vmstat.pgsteal_dma
      }
    });
    self.dispatch("pageallocs", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        movable: vmstat.pgalloc_movable,
        high   : vmstat.pgalloc_high,
        normal : vmstat.pgalloc_normal,
        dma32  : vmstat.pgalloc_dma32,
        dma    : vmstat.pgalloc_dma
      }
    });
    self.dispatch("pagescans_direct", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        movable: vmstat.pgscan_direct_movable,
        high   : vmstat.pgscan_direct_high,
        normal : vmstat.pgscan_direct_normal,
        dma32  : vmstat.pgscan_direct_dma32,
        dma    : vmstat.pgscan_direct_dma
      }
    });
    self.dispatch("pagescans_kswapd", {
      time: new Date().getTime(),
      type: "counter",
      data: {
        movable: vmstat.pgscan_kswapd_movable,
        high   : vmstat.pgscan_kswapd_high,
        normal : vmstat.pgscan_kswapd_normal,
        dma32  : vmstat.pgscan_kswapd_dma32,
        dma    : vmstat.pgscan_kswapd_dma
      }
    });
  });
};

module.exports = vmstat;
