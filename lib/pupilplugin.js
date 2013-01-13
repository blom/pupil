function PupilPlugin() {}

PupilPlugin.prototype.setName = function (name) {
  this._name = name;
};

PupilPlugin.prototype.setHandler = function (handler) {
  this._handler = handler;
};

PupilPlugin.prototype.dispatch = function (dataset, obj) {
  if ( obj.time === undefined )
    obj.time = new Date().getTime();

  this._handler(this._name + '.' + dataset, obj);
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
