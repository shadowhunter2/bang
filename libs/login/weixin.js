var url = require('url');
var https = require('https');

var OAUTH = {
  APP_ID: 'wx3603d2b6454fc47b',
  APP_KEY: '83216910fdfb9223182396889ba14f7b',
  OPEN_PLATFORM: 20
};


var weixin = {
  buildRequestUrl: function (redirectUrl) {
    var authorizeURL = "https://open.weixin.qq.com/connect/oauth2/authorize";
    var obj = {
      appid: OAUTH.APP_ID,
      redirect_uri: "http://bang.kktv5.com" + (redirectUrl || "user/weixin_callback"),
      response_type: "code",
      scope: "snsapi_login",
      state: Math.floor(Math.random() * 100000000000) + new Date().getTime()
    };

    return formatUrl(authorizeURL, obj);
  },
  getUserIds: function (code, cb) {
    var accessTokenURL = 'https://api.weixin.qq.com/sns/oauth2/access_token';

    var obj = {
      appid: OAUTH.APP_ID,
      secret: OAUTH.APP_KEY,
      grant_type: "authorization_code",
      code: code
    };

    httpsPost(accessTokenURL, obj, function (err, response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        return cb(e);
      }

      if (response.errmsg) {
        return cb(new Error(response.errmsg));
      }

      response.unionid = response.unionid || 0;

      cb(null, {
        accessToken: response.access_token,
        uid: response.unionid,
        openid: response.openid,
        refreshToken: response.refresh_token
      });
    });
  },
  refreshAccessToken: function (refreshTokenObj, cb) {
    var getRefreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token";
    var obj = {
      refresh_token: refreshTokenObj.refreshToken,
      appid: OAUTH.APP_ID,
      grant_type: "refresh_token"
    };
    var url = formatUrl(getRefreshTokenUrl, obj);

    httpsGet(url, function (err, data) {

      if (err) {
        return cb(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return cb(e);
      }
      cb(null, data);
    });
  },
  getUserInfo: function (accessTokenObj, cb) {
    var getUidUrl = "https://api.weixin.qq.com/sns/userinfo";
    var obj = {
      access_token: accessTokenObj.accessToken,
      openid: accessTokenObj.openid
    };

    var url = formatUrl(getUidUrl, obj);

    httpsGet(url, function (err, data) {

      if (err) {
        return cb(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return cb(e);
      }
      cb(null, data);
    });
  }
};

function formatUrl(url, params) {
  var query = require('querystring').stringify(params);
  url += "?" + query;
  return url;
}

function httpsGet(url, cb) {
  var req = https.get(url, function (res) {

    res.setEncoding('utf8');
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      cb(null, data);
      data = undefined;
    });

  });
  req.on('error', function (e) {
    sails.log.error("httpGet", url, "Got error: ", e.code);
    cb(e);
  });
  req.setTimeout(20 * 1000, function () {
    req.abort();
  });
}

function httpsPost(requestUrl, data, cb) {
  requestUrl = url.parse(requestUrl);
  data = require('querystring').stringify(data);

  var opt = {
    method: "POST",
    host: requestUrl.host,
    path: requestUrl.path,
    headers: {
      "Content-Type": 'application/x-www-form-urlencoded',
      "Content-Length": data.length
    }
  };

  var req = https.request(opt, function (serverResult) {
    if (serverResult.statusCode === 200) {
      var body = "";
      serverResult.on('data', function (data) {
        body += data;
      }).on('end', function () {
        cb(null, body);
      });
    } else {
      cb(new Error("request data fail"));
    }
  });
  req.on('error', function (e) {
    sails.log.error("httpPost", url, "Got error: ", e.code);
    cb(e);
  });
  req.setTimeout(20 * 1000, function () {
    req.abort();
  });

  req.write(data + "\n");
  req.end();
}

module.exports = weixin;
module.exports.OPEN_PLATFORM = OAUTH.OPEN_PLATFORM;
