var fs = require("fs");

var hasPlugin = function () {
  try {
    if (fs.statSync("/proc/meminfo").isFile()) {
      return ["usage"];
    }
  } catch (err) {}
  return false;
};

var runPlugin = function (ret) {
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
        cached: memory.cached,
        used:   memory.memtotal - memory.memfree,
        free:   memory.memfree
      }
    });
  });
};

module.exports = {
  test: hasPlugin,
  run:  runPlugin
};
