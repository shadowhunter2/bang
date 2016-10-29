var weixin = require("../../libs/login/weixin.js");
var qq = require("../../libs/login/qq.js");
var weibo = require("../../libs/login/weibo.js");
var querystring = require('querystring');
var urllib = require('url');

exports.profile = function (req, res, next) {
  if (req.method === "POST") {
    var profile = req.body.profile;
    if (!profile) {
      return res.send(400);
    }

    try {
      profile = JSON.parse(profile);
      setProfile(req, profile);
    } catch (e) {
      return res.send(400);
    }
    res.send({
      complate: 1
    });
  } else if (req.method === "GET") {
    var profile = req.session.profile || {};
    res.send(profile);
  } else {
    res.send(400);
  }
};

exports.heartbeat = function (req, res, next) {
  res.send(req.session.profile ? "heartbeat" : "");
};

exports.autoLogin = function (req, res, next) {
  var path = req.query.path || "/";
  var cookies = req.cookies || {};

  var finalFn = function () {
    res.redirect(path);
  };

  if (cookies.UPRO_NP) {
    var up = cookies.UPRO_NP;
    up = JSON.parse(kkUtils.sd(up));
    var logon = KKApi.Client.Logon();
    var ip = req.clientIp;
    logon.setHeaders('X-Forwarded-For', ip);
    logon.login({
      username: up.n,
      password: up.p
    }, function (err, data) {
      if (err) {
        clearPROCookies(req, res);
      } else {
        setProfile(req, data);
      }
      finalFn();
    });
  } else if (cookies.UPRO_WB) {
    var wbAccessToken = cookies.UPRO_WB;
    wbAccessToken = JSON.parse(kkUtils.sd(wbAccessToken));
    weibo.getUserId(wbAccessToken, function (err, result) {
      if (err) {
        return rs.send(err);
      }
      var uid = result.uid;
      weiboLogin(uid, req, res, function (err, profile) {
        if (err) {
          clearPROCookies(req, res);
        } else {
          setProfile(req, profile);
        }
        finalFn();
      });
    });

  } else if (cookies.UPRO_Q) {
    var qqAccessToken = cookies.UPRO_Q;
    qqAccessToken = JSON.parse(kkUtils.sd(qqAccessToken));
    qq.getOpenId(qqAccessToken, function (err, result) {
      if (err) {
        return res.send(err);
      }

      qqLogin(result.openid, qqAccessToken.accessToken, req, res, function (err, profile) {
        if (err) {
          clearPROCookies(req, res);
        } else {
          setProfile(req, profile);
        }
        finalFn();
      });
    });
  } else if (cookies.UPRO_WX) {
    var refreshToken = cookies.UPRO_WX;
    refreshToken = JSON.parse(kkUtils.sd(refreshToken));

    weixin.refreshAccessToken(refreshToken, function (err, data) {
      if (err) {
        return res.send(err);
      }
      var accessTokenObj = {
        accessToken: data.access_token,
        openid: data.openid
      };
      weixin.getUserInfo(accessTokenObj, function (err, info) {
        if (err) {
          return res.send(err);
        }
        var accessTokenObj = {
          openid: info.openid,
          uid: info.unionid,
          accessToken: data.access_token
        };
        weixinLogin(accessTokenObj, req, res, function (err, profile) {
          if (err) {
            clearPROCookies(req, res);
          } else {
            setProfile(req, profile);
          }
          finalFn();
        });
      });
    });
  }
  else {
    finalFn();
  }
};

exports.logout = function (req, res, next) {
  var referer = req.query.redirect || req.headers.referer || "/";

  req.session.destroy();

  clearPROCookies(req, res);

  // res.redirect(referer);
  res.redirect('/');
};

exports.ajaxLogout = function (req, res, next) {

  // var referer = req.query.redirect || req.headers.referer || "/";

  req.session.destroy();

  clearPROCookies(req, res);

  res.send({
    complate: 1
  });

  // res.redirect(referer);
};

exports.register = function (req, res, next) {

  if(req.method == 'GET'){

    res.view();

  }

};


exports.third = function (req, res, next) {
  var part = req.query.name;
  var url = req.query.url;

  /*if (part === "qq") {
    var url = qq.buildRequestUrl("/user/qq_callback/");
    return res.redirect(url);
  } else if (part === 'weibo') {
    var url = weibo.buildRequestUrl("/user/weibo_callback/" + (url ? "?url=" + encodeURIComponent(url) : ""));
    return res.redirect(url);
  } else */

  if (part === "weixin") {

    var roomId = req.query.roomId,
      sharerId = req.query.sharerId,
      djShareId = req.query.djShareId;

    var url = weixin.buildRequestUrl(
      "/user/weixin_callback/?url=" + encodeURIComponent(url) + '&djShareId=' + djShareId + '&roomId=' + roomId + '&sharerId=' + sharerId );
    return res.redirect(url);
  }
  return res.send(400);
};

exports.weixin_callback = function (req, res, next) {
  var code = req.query.code;
  var url = req.query.url || "/";

  // sails.log.info('weixin_callback query is url: ', req.query.url);

  if (!code) {
    return res.send(400);
  }

  weixin.getUserIds(code, function (err, result) {
    if (err) {
      return res.redirect(url);
    }

    var plaintext = JSON.stringify({refreshToken: result.refreshToken});

    var ciphertext = kkUtils.se(plaintext);

    res.cookie('UPRO_WX', ciphertext, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    weixinLogin(result, req, res, function (err, profile) {
      if (err) {
        return res.send(err);
      }

      if (profile.userId) {
        var bindWechat = {};
        bindWechat['unionId'] = result.uid;
        bindWechat['re_openid'] = result.openid;
        req.session.bindWechat = bindWechat;
      }

      setProfile(req, profile);
      res.redirect(url);
    });

  });

};

function weixinLogin(accessTokenObj, req, res, cb) {

  var clientIpArr = req.clientIp.split(':');
  var len = clientIpArr.length;

  var _cid =  querystring.parse( urllib.parse( req.query.url ).query ).cid;

  var loginInfo = {
    loginType: weixin.OPEN_PLATFORM,
    uuid: accessTokenObj.openid,
    clientIp: clientIpArr[len - 1],
    unionid: accessTokenObj.uid,
    accessToken: accessTokenObj.accessToken,
    c: _cid || '100101'
  };

  var getUserInfoFn = function (cb) {
    weixin.getUserInfo(accessTokenObj, function (err, userInfo) {
      if (err) {
        return cb(err);
      }

      var user = {
        nickname: userInfo.nickname
      };
      var channel = req.cookies.channel;
      if (channel) {
        user.channel = channel;
        res.clearCookie('channel', {
          path: '/'
        });
      }

      user.gender = userInfo.sex == 2 ? 0 : userInfo.sex;
      user.photo = userInfo.headimgurl;

      return cb(null, user);
    });
  };

  loginOrRegister(loginInfo, getUserInfoFn, cb, req, res);
}

function loginOrRegister(loginInfo, getUserInfoFn, cb, req, res) {
  var roomId = req.query.roomId,
      sharerId = req.query.sharerId,
      djShareId = req.query.djShareId;

  var logon = KKApi.Client.Logon();
  var clientIp = req.get('cdn-src-ip') || "0.0.0.0";
  var clientPort = req.get('x-cdn-src-port') || 0;

  logon.setHeaders({
    "kkClientIp" : clientIp,
    "kkClientPort" :  clientPort
  })

  logon.loginThird(loginInfo, function (err, loginRes) {

    if (err && err.name == KKApi.Client.APIError.REQUEST_ERROR && err.detail === '01070103') {
      // 01070103 无用户记录，该用户未注册或密码错误
      // sails.log.info('need registerThird');
      return getUserInfoFn(function (err, userInfo) {
        if (err) {
          return cb(err);
        }

        var parameter = {
          openPlatform: loginInfo.loginType,
          uuid: loginInfo.uuid,
          clientIp: loginInfo.clientIp,
          nickname: (userInfo.nickname),
          gender: userInfo.gender,
          photo: userInfo.photo,
          c: loginInfo.c
        };

        if(roomId !== 'undefined' && roomId !== '' && sharerId != 'undefined' && sharerId !== ''){
          parameter.sharerCode =  '{roomId: ' + roomId + ',sharerId: ' + sharerId + '}';
        }

        if(djShareId !== 'undefined' && djShareId !== ''){
          parameter.djShareId =  djShareId;
        }

        if(roomId !== 'undefined' && roomId !== ''){
          sails.log.info('roomId',roomId)
          parameter.referrerId =  roomId;
        }

        if (loginInfo.unionid) {
          parameter.unionid = loginInfo.unionid;
        }
        if (loginInfo.accessToken) {
          parameter.sessionId = loginInfo.accessToken;
        }

        if (userInfo.channel) {
          parameter.channel = userInfo.channel;
        }

        var getRedPacketKey = req.cookies.getRedPacketKey;
        if(!getRedPacketKey){
          getRedPacketKey = Math.random().toString().replace('.','');
          res.cookie('getRedPacketKey', getRedPacketKey, {
            expires: new Date(Date.now() + 7 * 60 * 60 * 24 * 1000)
          });
        }
        parameter.getRedPacketKey = getRedPacketKey;

        logon.registerThird(parameter, function (err, data) {
          if (err) {
            return cb(err);
          }

          console.log("data.loginResult", data)

          data.loginResult.newGift = data.newGift;

          return cb(null, data.loginResult);

        });
      });
    }
    else if (err) {
      return cb(err);
    } else {
      return cb(null, loginRes);
    }
  });
}


function setProfile(req, profile) {
  profile.simple = {
    userId: profile.userId,
    token: profile.token
  };
  req.session.profile = profile;
}

function clearPROCookies(req, res) {
  var cookies = req.cookies;
  Object.keys(cookies).forEach(function (c) {
    if (/^UPRO_/i.test(c)) {
      res.cookie(c, "", {
        expires: new Date(1970, 0, 1)
      });
    }
  });
}
