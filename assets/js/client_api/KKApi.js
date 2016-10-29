function kktv() {
  }

  var log = function () {
    window.console && console.log && console.log([].join.call(arguments, ", "));
  };

  kktv.prototype.version = clientServerConfig.SERVER_LIFT_TIME;

  kktv.prototype.domain = 'http://www.kktv5.com';

  kktv.prototype.postDataToServer = function (host, parameterString, isJSONP, callback) {
    var task;
    if (typeof host !== 'string') {
      throw Error('Illegal Argument Exception');
    }
    if (typeof callback !== 'function') {
      throw Error('Illegal Argument Exception');
    }
    task = {
      host: host,
      parameter: parameterString,
      callback: callback,
      isJSONP: isJSONP
    };
    return this._doTask(task);
  };

  kktv.prototype._doTask = function (task) {
    var options;
    options = {
      type: 'GET',
      timeout: 20 * 1000,
      async: true,
      dataType: task.isJSONP ? 'jsonp' : 'json',
      url: task.host,
      headers: {
        'If-Modified-Since': '0'
      },
      data: task.parameter,
      beforeSend: function () {
        return log(new Date().toString(), 'kktv client do task:', this.url);
      },
      error: function (textStatus, errorThrown) {
        if (errorThrown === 'timeout') {
          var _e = new Error();
          _e.name = 'timeout';
          _e.message = 'request timeout';
          return task.callback(_e);
        } else {
          var _e = new Error();
          _e.name = 'unknow';
          _e.message = errorThrown;
          return task.callback(_e);
        }
        return log("kktv client error: ", JSON.stringify(textStatus), errorThrown);
      },
      success: function (data, textStatus, XMLHttpRequest) {
        if (typeof task.callback !== 'function') {
          return;
        }
        return task.callback(null, data);
      }
    };
    return $.ajax(options);
  };

  kktv.prototype.PLATFORM = {
    WEB: 1,
    ANDROID: 2,
    IPHONE: 3,
    IPAD: 4
  };
  kktv.prototype.C = 100101;
  kktv.prototype.A = 1;

  module.exports = kktv;
