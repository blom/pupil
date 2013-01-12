function PupilPlugin() {}

PupilPlugin.prototype.foo = function () {
  console.log('foo!');
};

PupilPlugin.prototype.test = function () {
  return false;
};

PupilPlugin.prototype.run = function (ret) {
  return false;
};

module.exports = function () {
  function P() {}
  P.prototype = new PupilPlugin();

  return P;
};
