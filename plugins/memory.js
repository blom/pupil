var fs          = require('fs')
  , pupilPlugin = require('../lib/pupilplugin')
  , memory      = new pupilPlugin()

memory.prototype.test = function () {
  try {
    if (fs.statSync("/proc/meminfo").isFile()) {
      return ["usage"];
    }
  } catch (err) {}
  return false;
};

memory.prototype.run = function (ret) {
  fs.readFile("/proc/meminfo", "utf8", function (err, data) {
    if (err) throw err;
    var memory = {};

    data.split("\n").forEach(function (line) {
      var r = /^(\S+):\s+(\d+)/.exec(line);
      if (r instanceof Array) {
        memory[r[1].toLowerCase()] = r[2] * 1024;
      }
    });

    ret("memory.usage", {
      time: new Date().getTime(),
      type: "gauge",
      draw: "stacked",
      data: {
        used:   memory.memtotal - memory.memfree,
        cached: memory.cached,
        free:   memory.memfree
      }
    });
  });
};

module.exports = new memory();
