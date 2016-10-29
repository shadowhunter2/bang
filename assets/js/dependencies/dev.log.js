var UA = require('./browser.js');
function log() {
  var args = Array.prototype.slice.call(arguments);
  args.push("log");

  log._p.apply(null, args);
};

log.color = function () {
  var args = Array.prototype.slice.call(arguments);
  args.length === 1 && args.push("red");
  var color = args.pop();
  args = args.map(function (arg) {
    return typeof arg === "object" ? JSON.stringify(arg) : arg;
  });
  args.push('color: ' + color + ';font-weight:bold; font-size: 18px');

  log.apply(null, args);
};

log._p = function () {
  var args = Array.prototype.slice.call(arguments);
  var type = args.pop();
 // args.unshift("debug [" + kkUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss") + "]");
  if (/^color\:/.test(args[args.length - 1])) {
    var cl = args.pop();
    args = ["%c" + args.join(" "), cl];
  }
  if (typeof console != "undefined") {
    if (UA.ie && UA.ie <= 9) {
      console[type]([].join.call(args, ","));
    } else {
      console[type]([].join.call(args, ","));
    }
  }
}

log.debug = function () {
  var args = Array.prototype.slice.call(arguments);
  args.push("debug");

  log._p.apply(null, args);
};
log.warn = function () {
  var args = Array.prototype.slice.call(arguments);
  args.push("warn");

  log._p.apply(null, args);
};
log.error = function () {
  var args = Array.prototype.slice.call(arguments);
  args.push("trace");

  log._p.apply(null, args);
};

module.exports = log;
