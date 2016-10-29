var toast = require('../com/toast/toast.js'),

  ROOM_MEESAGES = require('./message.api.js'),

  API = ROOM_MEESAGES.API;

$(function () {
  var ERROR_CODE = {
    HEARTBEAT_TIMEOUT: 1,
    KICKOUT_USER: 2,
    KICKOUT_BY_SYSTEM: 3,
    PROHIBIT_VISITORS: 4,
    PROHIBIT_REGISTERED_USERS: 5,
    VISITORS_FULL: 6,
    REGISTERED_USERS_FULL: 7,
    OTHER_LOGIN: 8,
    ACOTR_TRAIN: 9,
    ACTOR_ALREADY_IN_ROOM: 10,
    USER_LOGIN_DUPLICATE: 12,
    LIVE_RESTRICTED_TO_USER: 14,
    LIVE_RESTRICTED_TO_ACTOR: 15,
    BACKLIST_TO_USER: 16,
    BACKLIST_TO_ACTOR: 17,
    GUEST_PROHIBIT_ACCESS: 19
  },

  __ = i18n.__;

  function forbiddenUser() {
    utils.artDialog(__('not allow to enter'), 0, null, new Function(), null, __('okey'), function () {
      window.location.reload();
    });
  }

  function kickoutUser() {

    toast.show({
      text: __('not allow to enter 2'),
      position: 'center'
    });

    /* todo
    var gotoHomePage = true;
    utils.artDialog(__('not allow to enter 2'), 0, function () {
      gotoHomePage = false;
      window.location = "/shop/";
    }, new Function(), __('get more powers'), __('go home'), function () {
      if (gotoHomePage) {
        window.location.reload();
      }
    });
    */
  }

  function heartbeatTimeout() {
    utils.artDialog(__("socket connection lost"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function kickoutBySystem() {
    utils.artDialog(__("live is stopped"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function prohibitVisitors() {
    var gotoHomePage = true;
    utils.artDialog(__("visitors saturated"), 0, function () {
      // gotoHomePage = false;
      // $("a#loginLink").trigger("click");
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.href);
    }, new Function(), __("login"), __("cancel"), function () {
      if (gotoHomePage)
        window.location.reload();
    })
  }

  function prohibitRegisteredUsers() {

    utils.artDialog(__("user saturated"), 0, function () {

      window.location.reload();
    }, null, __("back plaza"), null, function () {
        window.location.reload();
    });

    /*
    var gotoHomePage = true;
    utils.artDialog(__("user saturated"), 0, function () {
      gotoHomePage = false;
      window.location = "/shop";
    }, new Function(), __("buy vip"), __("cancel"), function () {
      if (gotoHomePage)
        window.location.reload();
    })
    */
  }

  function visitorsFull() {
    // var gotoHomePage = true;
    utils.artDialog(__("visitors saturated 2"), 0, function () {
      // gotoHomePage = false;
      // $("a#loginLink").trigger("click");
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.href);
    }, new Function(), __("login"), __("cancel"), function () {
      // if (gotoHomePage)
        window.location.reload();
    })
  }

  function registeredUsersFull() {
    utils.artDialog(__("user saturated 2"), 0, function () {

      window.location.reload();
    }, null, __("back plaza"), null, function () {
        window.location.reload();
    });

    /*
    var gotoHomePage = true;
    utils.artDialog(__("user saturated 2"), 0, function () {
      gotoHomePage = false;
      window.location = "/shop";
    }, new Function(), __("buy vip"), __("cancel"), function () {
      if (gotoHomePage)
        window.location.reload();
    })
    */
  }

  function otherLogin() {
    utils.artDialog(__("socket invalid"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function acotrTrainRoom() {
    utils.artDialog(__("only avtor enter"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function alreadyInRoom() {
    utils.artDialog(__("enter duplicate for actor"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function userLoginDuplicate() {
    utils.artDialog(__("enter duplicate for user"), 0, null, new Function(), null, __("cancel"), function () {
      window.location.reload();
    })

    setTimeout(function () {
      window.location.reload();
    }, 3000)

  }

  function blacklistToUser() {
    utils.artDialog(__("account disabled for user"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function blacklistToActor() {
    $.get("/user/ajaxLogout", function () {
      utils.artDialog(__("account disabled for actor"), 0, null, new Function(), null, __("okey"), function () {
        window.location.reload();
      })
    })

  }

  function liveRestrictedToUser() {
    utils.artDialog(__("account restricted for user"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function liveRestrictedToActor() {
    utils.artDialog(__("account restricted for actor"), 0, null, new Function(), null, __("okey"), function () {
      window.location.reload();
    })
  }

  function guestProhibitAccess() {
    // var gotoHomePage = true;
    utils.artDialog(__("activiy room login"), 0, function () {
      // gotoHomePage = false;
      // $("a#loginLink").trigger("click");
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.href);
    }, new Function(), __("login"), __("cancel"), function () {
      // if (gotoHomePage)
        window.location.reload();
    })
  }

  message.register(INTERNAL_MESSAGES.PERMIT_FORBIDDEN, function () {
    forbiddenUser();
  })
  message.register(INTERNAL_MESSAGES.PERMIT_CROWD, function () {
    if (profile.isLogin) {
      prohibitRegisteredUsers();
    } else {
      prohibitVisitors();
    }
  })

  message.register(API.ERROR_MESSAGE, function (data) {

    wsm.finish();

    switch (data.errCode) {
      case ERROR_CODE.HEARTBEAT_TIMEOUT:
        heartbeatTimeout();
        break;
      case ERROR_CODE.KICKOUT_USER:
        kickoutUser();
        break;
      case ERROR_CODE.KICKOUT_BY_SYSTEM:
        kickoutBySystem();
        break;
      case ERROR_CODE.PROHIBIT_VISITORS:
        prohibitVisitors();
        break;
      case ERROR_CODE.PROHIBIT_REGISTERED_USERS:
        prohibitRegisteredUsers();
        break;
      case ERROR_CODE.VISITORS_FULL:
        visitorsFull();
        break;
      case ERROR_CODE.REGISTERED_USERS_FULL:
        registeredUsersFull();
        break;
      case ERROR_CODE.OTHER_LOGIN:
        otherLogin();
        break;
      case ERROR_CODE.ACOTR_TRAIN:
        acotrTrainRoom();
        break;
      case ERROR_CODE.ACTOR_ALREADY_IN_ROOM:
        alreadyInRoom();
        break;
      case ERROR_CODE.USER_LOGIN_DUPLICATE:
        userLoginDuplicate();
        break;
      case ERROR_CODE.LIVE_RESTRICTED_TO_USER:
        liveRestrictedToUser();
        break;
      case ERROR_CODE.LIVE_RESTRICTED_TO_ACTOR:
        liveRestrictedToActor();
        break;
      case ERROR_CODE.BACKLIST_TO_USER:
        blacklistToUser();
        break;
      case ERROR_CODE.BACKLIST_TO_ACTOR:
        blacklistToActor();
        break;
      case ERROR_CODE.GUEST_PROHIBIT_ACCESS:
        guestProhibitAccess();
        break;
      default:
        utils.artDialog(data.desc ? data.desc : __("socket close by unknown error", data.errCode), 30000, function () {
          window.location.reload();
        }, null, __("ok"));
        break;
    }
  });

  /*
  message.register(API.ALERT_MESSAGE, function (data) {
    utils.artDialog(data.desc, 0, data.confirm ? function () {
      if (data.confirmJump) {
        window.location = data.confirmJump;
      }
    } : null, data.cancel ? function () {
      if (data.cancelJump) {
        window.location = data.cancelJump;
      }
    } : null, data.confirm, data.cancel);
  });
  */

  message.register(API.BUY_TOOLS_MESSAGE, function (data) {
    /*
    utils.artDialog(data.content, 0, function () {
      window.open("/Shop/")
    }, new Function(), __("goto buy vip"));
    */

    utils.artDialog(data.content);

  });
});

