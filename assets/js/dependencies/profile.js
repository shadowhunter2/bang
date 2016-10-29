"use strict";

var profile = {}, jsonObj, cbList = [];

profile.ready = function (cb) {
  if (jsonObj) {
    return cb.call(this);
  }

  return cbList.push(cb);

};

profile.getProfileJson = function () {
  return jsonObj;
};

profile.setProfileJson = function (valid, callback) {
  if (typeof callback != "function") {
    callback = function () {
    };
  }
  if (typeof valid != "object") {
    callback(Error("Illegal Argument Exception"));
  }

  saveJson(valid, callback);
};

profile.expired = function (callback) {
  if (typeof callback != "function") {
    callback = new Function;
  }

  expired(callback);
};

function defineProperties() {
  var data = jsonObj;
  var isLogin = !!(data.userId && data.token);
  var bastUserId = kkUtils.getBestUserId(data);
  var simple = {};
  Object.defineProperties(simple, {
    userId: {value: data.userId, enumerable: true},
    token: {value: data.token, enumerable: true}
  });

  Object.freeze(simple);

  Object.defineProperties(profile, {
    'isLogin': {value: isLogin, enumerable: true, configurable: true},
    'hasActorPower': {value: isLogin && !!data.actorTag, enumerable: true, configurable: true},
    'bestUserId': {value: bastUserId, enumerable: true, configurable: true},
    'userId': {value: data.userId, enumerable: true, configurable: true},
    'token': {value: data.token, enumerable: true, configurable: true},
    'simple': {value: simple, enumerable: true, configurable: true}
  });

};

function expired(callback) {
  var my = Client.My(profile.simple);
  my.info(function (err, data) {
    if (err) {
      return callback(err);
    } else {
      data.token = profile.token;
      saveJson(data, callback);
    }
  })
}

function saveJson(valid, callback) {
  var jsonString = JSON.stringify(valid);

  $.ajax({
    statusCode: {
      400: function () {
        alert("illegal char");
      }
    },
    type: "post",
    url: "/user/profile",
    data: {
      profile: jsonString
    },
    success: function (result) {
      jsonObj = valid;
      defineProperties();
      callback.call(profile, result.complate);
    }
  });
}

function request(callback) {
  var parentDomain, parentWindow;
  try {
    parentWindow = window.parent.window;
  } catch (e) {
    parentWindow = undefined;
  }
  try {
    parentDomain = window.parent.window.document.domain.toString();
  }
  catch (e) {
    parentDomain = undefined;
  }
  if (window == parentWindow || parentDomain !== window.document.domain.toString()) {
    $.getJSON("/user/profile?v=" + new Date().getTime(), callback);
  } else {
    var si = setInterval(function () {
      var parentProfile = window.parent.window.profile;
      if (parentProfile) {
        clearInterval(si);
        parentProfile.ready(function () {
          callback(parentProfile.getProfileJson());
          log("get profile from parent");
        });
      } else {
        log("fail to get profile from parent");
      }
    }, 50);
  }

};

request(function (data) {

  jsonObj = data;
  defineProperties();
  var cb;
  while (cb = cbList.shift()) {
    cb.call(profile);
  }
});

window.profile = profile;

module.exports = profile;
