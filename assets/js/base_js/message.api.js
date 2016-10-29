window.INTERNAL_MESSAGES = {
    SOCKET_CLOSED: "socket_closed",
    SOCKET_RECONNECT : "socket_reconnect",
    PERMIT_CROWD : "permit_crowd",
    PERMIT_FORBIDDEN : "permit_forbidden"
};

var ROOM_MEESAGES = {
  DISPATCH_MESSAGE : function(json) {

    if (typeof json != "object") {
      return;
    }
    message.dispatch(json.MsgTag, json);
    json = null;
  }
};

(function(exp) {

  function MdeAPI(modType, MsgTag) {
    this.modType = modType;
    this.MsgTag = MsgTag;
  }
  MdeAPI.prototype.toString = function() {
    return this.modType.toString() + this.MsgTag.toString();
  };

  var API = {
    GET_ACTOR_INFO : 10010204,
    USER_GOTO_LOGIN : 10010201,
    USER_LOGIN : 10010202,
    HEART_MESSAGE : 10010299,
    GET_GIFT : 10010208,
    TEXT_MESSAGE : 10010209,
    SHOOT_BARRAGE : 10010209,
    PRIVATE_ROOM : 10010308,
    ALERT_MESSAGE: 21,
    BUY_TOOLS_MESSAGE: 40000002,
    ERROR_MESSAGE: 30000003,
    USER_LIST : 10010206,
    GUEST_ENTER : 20020122,
    GUEST_EXIT : 20020112,
    USER_ENTER : 20020123,
    USER_EXIT : 20020113,
    SYSTEM_MESSAGE: 30000001,
    TICK_MESSAGE: 10010223,
    DISABLED_SEND: 10010224,

    LIVE_STOP: 10010211,

    GIFT_GOODS: 10010207,
    GIFT_STORE:10010266,

    JDY_INFO: 10010353,
    GET_JDY_SUCCESS: 10010354,
    SHOW_MONEY: 10010238,
    BANG_MONEY: 10010370,
    GET_RED_MONEY: 10010896
  };

  var __ = i18n.__;

  var CODE = {
    LESS_MONEY: {
      TAG: 20020111,
      MESSAGE: __('insufficient balance')
    },
    LOGIN_EXPIRED: {
      TAG: 20020107,
      MESSAGE: __('token invalid')
    },
    PARK_FAIL: {
      TAG: 50010202,
      MESSAGE: __('parking fail')
    },
    PROHIBITED: {
      TAG: 20020130,
      MESSAGE: __('enter restricted room')
    },
    ALREADY_EXIT: {
      TAG: 20020114,
      MESSAGE: __('miss target')
    }
  };

  exp.API = API;
  exp.CODE = CODE;

})(ROOM_MEESAGES);

// var API = ROOM_MEESAGES.API;

module.exports = ROOM_MEESAGES;
