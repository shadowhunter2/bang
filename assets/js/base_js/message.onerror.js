var toast = require('../com/toast/toast.js'),

  ROOM_MEESAGES = require('./message.api.js'),

  CODE = ROOM_MEESAGES.CODE;

message.register(CODE.LESS_MONEY.TAG, function () {
  var msg = CODE.LESS_MONEY.MESSAGE;

  toast.show({
    text: msg,
    position: "center"
  })

  //todo
  /*
  utils.dialog({
    content: msg,
    positiveCallback: function () {
      window.open("/pay");
    },
    negativeCallback: new Function,
    positiveButtonName: __('recharge'),
    negativeButtonName: __('okey'),
    sign: CODE.LESS_MONEY.TAG
  });
  */
});

message.register(CODE.ALREADY_EXIT.TAG, function () {
  toast.show({
    text: CODE.ALREADY_EXIT.MESSAGE,
    position: "center"
  })
})

message.register(CODE.PARK_FAIL.TAG, function () {
  toast.show({
    text: CODE.PARK_FAIL.MESSAGE,
    position: "center"
  })
})

message.register(CODE.LOGIN_EXPIRED.TAG, function () {
  if(UA.isWeixin){
    utils.artDialog($.i18n.__('token invalid'), 0, function () {
      window.location = "/user/third?name=weixin&url=" + encodeURIComponent(window.location);
    }, null, $.i18n.__('login'));
  }
  else{
     utils.artDialog('您的登录已失效，请重新进入房间', 0, function () {

    }, null, '确定');
  }

})

message.register(CODE.PROHIBITED.TAG, function () {
  var msg =  CODE.PROHIBITED.MESSAGE;

  toast.show({
    text: msg,
    position: "center"
  })

  /*
  utils.artDialog(msg, 0, function () {
    window.location = "/shop";
  }, function () {
    window.location = "/"
  }, $.i18n.__('goto buy vip'), $.i18n.__('go home'));

  */
});


