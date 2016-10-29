var ROOM_MEESAGES = require('./message.api.js'),

  API = ROOM_MEESAGES.API;

var PLATFORM = {
    WEB: 1,
    ANDROID: 2,
    IPHONE: 3,
    IPAD: 4
};

// $(function () {


  var SOFT_VERSION = 10040;
  var socketWillDisconnect = false;

var communicate =  function () {

  var PERMIT = {
    FORBIDDEN: 0,
    OK: 1,
    CROWD: 2
  };

  var password, ws, heartQueue, wsm = {}, waitList = [], win = window;

  function connect() {
    setTimeout(init, 100, into);
    heartQueue && (clearInterval(heartQueue), heartQueue = undefined);

    heartQueue = setInterval(function () {
      var obj = {
        MsgTag: API.HEART_MESSAGE
      };
      sendMessage(obj);
    }, 1000 * 60 * 5);
  };

  function init(intoJson) {
    if (intoJson.ErrTag === 0) {
      if (intoJson.permit === PERMIT.FORBIDDEN) {
        return message.dispatch(INTERNAL_MESSAGES.PERMIT_FORBIDDEN);
      } else if (intoJson.permit === PERMIT.CROWD && !(profile.isLogin && profile.getProfileJson().props.length > 0)) {
        return message.dispatch(INTERNAL_MESSAGES.PERMIT_CROWD);
      }

      if (ws !== undefined) {
        ws.onopen = ws.onerror = ws.onclose = ws.onmessage = null;
        ws.close();
      }
      ws = new WebSocket(intoJson.ws);
      log("ws:" + intoJson.ws);

      ws.onopen = onOpen;
      ws.onmessage = onMessage;
      ws.onclose = onClose;
      ws.onerror = onError;


    } else {
      log("ws connect error:" + intoJson.desc);
    }
  }

  function onOpen(e) {

    log("ws connect ready");
    socketWillDisconnect = false;

    setTimeout(login);

    setTimeout(function () {
      var list = waitList;
      waitList = undefined;
      var msg;
      while (msg = list.shift()) {
        sendMessage(msg);
      }
    });
  }

  function onMessage(e) {
    var obj;
    var data = e.data;
    var reg = /<|\&\#\d+/g;
    if (reg.test(data)) {
      data = utils.HTMLEncode(data);
    }
    try {
      obj = JSON.parse(data);
    } catch (ex) {
      return log.error("JSON.parse fail:" + ex.message + ", data = " + data);
    }
    mapping.decode(obj);
    // log("decode:" + data);
    if (obj.modType) {
      obj.MsgTag = obj.modType.toString() + obj.MsgTag.toString();
      obj.modType = undefined;
    }
    ROOM_MEESAGES.DISPATCH_MESSAGE(obj);
    e = null;
    obj = null;
    data = null;
    reg = null;
  }

  function onClose(e) {
    message.dispatch(INTERNAL_MESSAGES.SOCKET_CLOSED);

    !socketWillDisconnect && setTimeout(wsReConnect, 1000);
  }

  function onError(e) {

    log.error("ws on error:", JSON.stringify(e));
  }

  function setPassword(code) {
    password = code;
  }

  function login() {
    var loginJson = {
      MsgTag: API.USER_GOTO_LOGIN,
      platform: PLATFORM.WEB,
      roomId: uid,
      container: 1,
      softVersion: SOFT_VERSION,
      linking: window.location.hostname
    };

    if (password !== undefined) {
      loginJson.password = password;
    }

    if (profile.isLogin) {
      loginJson.userId = profile.userId;
      loginJson.token = profile.token;
    } else {
      loginJson.guestUid = getCookie('guestUid');
    }

    sendMessage(loginJson);
  };

  function getCookie(name){
    var arr=document.cookie.split('; ');
    for(var i=0;i<arr.length;i++){
      var arr2=arr[i].split('=');
      if(arr2[0]==name){
        return arr2[1];
      }
    }
    return '';
  }

  function sendMessage(obj) {
    if (waitList) {
      return waitList.push(obj);
    }
    if (typeof  obj !== "object") {
      return false;
    }
    if (obj.MsgTagObj) {
      var tagObj = obj.MsgTagObj;
      obj.MsgTagObj = undefined;

      obj.MsgTag = tagObj.MsgTag;
      obj.modType = tagObj.modType;
      tagObj = null;
    }

    mapping.encode(obj);
    var msg = JSON.stringify(obj);
    log("ws send:", obj);
    ws.send(msg);
    obj = null;
  }

  function finish() {
    socketWillDisconnect = true;
    heartQueue && (clearInterval(heartQueue), heartQueue = undefined);
    ws.close();

    log("socket finish");
  }

  function wsReConnect() {
    var dlg = utils.dialog(i18n.__('socket irregular close'), 0, null, function () {
      window.location = location.href;
    }, null, i18n.__('cancel'), null, "wsStartReConnect");

    if (!wsReConnect.key) {
      wsReConnect.key = message.once(API.USER_LOGIN, function userLogin() {
        message.dispatch(INTERNAL_MESSAGES.SOCKET_RECONNECT);
        dlg.close().remove();
        wsReConnect.key = undefined;
        log("ws re-connect success");
      });
    }

    setTimeout(init, 100, into);
  }

  win.wsm = wsm;
  wsm.setPassword = setPassword;
  wsm.sendMessage = sendMessage;
  wsm.finish = finish;
  wsm.connect = connect;

  message.register(API.USER_LOGIN, function (data) {
    message.dump("socket ready");
  });

  UA.ie && UA.ie <= 9 && $(win).on("unload", function () {
    wsm.finish();
  });

  profile.ready(function () {
    wsm.connect();
  });

};

// });
module.exports = communicate;
