var message = {
  _map: {},
  register: function (messageType, callback) {
    var tp = Object.prototype.toString.call(messageType);
    if (tp === "[object Object]") {
      messageType = messageType.toString();
    }

    if (typeof callback != "function") {
        return false;
    }
    var fn = function (mtype) {
      var index = 0;
      if (!this._map[mtype]) {
        this._map[mtype] = [callback];
      } else {
        index = this._map[mtype].push(callback) - 1;
      }
      return mtype + "#" + index;
    }.bind(this);

    return tp === "[object Array]" ? messageType.map(fn) : fn(messageType);
  },
  unregister: function (messageType, callback) {
    if (!messageType) {
      return false;
    }
    if (/(.+)\#(\d+)$/.test(messageType) && !callback) {
      var messageType = RegExp.$1;
      var index = +RegExp.$2;
      var calls = this._map[messageType];
      if (!calls || index >= calls.length) {
        return false;
      } else {
        calls.splice(index, 1);
        if (calls.length === 0) {
          delete this._map[messageType];
        }
        return true;
      }
    }

    var calls = this._map[messageType];
    if (!calls || calls.length === 0) {
      return false;
    }
    if (typeof callback != "function") {
      for (var i = 0; i < calls.length; i++) {
        calls[i] = undefined;
      }
      delete this._map[messageType];
    } else {
      for (var i = 0; i < calls.length; i++) {
        calls[i] = callback === calls[i] ? undefined : calls[i];
      }
    }
  },
  once: function (messageType, callback) {
    var m = this.register(messageType, function (data) {
      this.unregister(m);
      callback(data);
    }.bind(this));

    return m;
  },
  ignore: function (key) {
    if (!/(.+)\#(\d+)$/.test(key)) {
      return false;
    }
    var messageType = RegExp.$1;
    var index = parseInt(RegExp.$2);
    var calls = this._map[messageType];
    if (!calls || index >= calls.length) {
      return false;
    }
    var fun = calls[index];
    var newFn = new Function();
    newFn.fn = fun;
    calls[index] = newFn;
    return true;
  },
  attention: function (key) {
    if (!/(.+)\#(\d+)$/.test(key)) {
      return false;
    }
    var messageType = RegExp.$1;
    var index = parseInt(RegExp.$2);
    var calls = this._map[messageType];
    if (!calls || index >= calls.length) {
      return false;
    }
    var fun = calls[index];
    if (!fun.fn) {
      return false;
    }
    calls[index] = fun.fn;
    delete fun.fn;
    return true;
  },
  callbackList: function (messageType) {
    if (this._map[messageType]) {
      return this._map[messageType];
    }
    return null;
  },
  dispatch: function (messageType/* ,args */) {
    if (!messageType) {
      throw new Error('Null Pointer Exception');
    }
    var _this = this;
    if (!_this._map[messageType]) {
      return;
    }
    var arr = _this._map[messageType];
    var args = Array.prototype.slice.call(arguments, 1);
    if (typeof args != "object") {
      alert("bad object");
      return;

    }

    arr.forEach(function (fn, i) {
      fn && setTimeout(function () {
        fn.apply(null, args);
      }, i * 20);
    });
  },
  dump: function (messageType/* ,args */) {
    if (!messageType) {
      throw new Error('Null Pointer Exception');
    }
    var _this = this;
    if (!_this._map[messageType]) {
      return;
    }
    var arr = _this._map[messageType];
    var args = Array.prototype.slice.call(arguments, 1);
    if (typeof args != "object") {
      alert("bad object");
      return;
    }
    while (arr.length > 0) {
      var callback = arr.shift();
      callback && (function (cb) {
        setTimeout(function () {
          cb.apply(null, args);
          cb = undefined;
        }, 20);
      })(callback)
    }
  }
};
module.exports = message;
