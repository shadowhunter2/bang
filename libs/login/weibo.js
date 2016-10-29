var url = require('url');
var https = require('https');

var WEIBO_OAUTH = {
  APP_ID : 1312131448,
  APP_KEY : "1440ac4041294b99a2bb51dcdd467cc2",
  OPEN_PLATFORM : 2
};


var weibo = {
  buildRequestUrl : function(redirectUrl) {
    var authorizeURL = "https://api.weibo.com/oauth2/authorize";
    var obj = {
      client_id : WEIBO_OAUTH.APP_ID,
      // redirect_uri : "http://www.kktv5.com" + (redirectUrl || "/user/weibo_callback/"),
      redirect_uri : "http://www.imkk.tv" + (redirectUrl || "/user/weibo_callback/"),
      response_type : "code",
      state : Math.floor(Math.random() * 100000000000) + new Date().getTime()
    };

    return formatUrl(authorizeURL, obj);
  },
  getAccessToken : function(code, cb) {
    var accessTokenURL = 'https://api.weibo.com/oauth2/access_token';

    var obj = {
      client_id : WEIBO_OAUTH.APP_ID,
      client_secret : WEIBO_OAUTH.APP_KEY,
      // redirect_uri : "http://www.kktv5.com/user/weibo_callback/",
      redirect_uri : "http://www.imkk.tv/user/weibo_callback/",
      grant_type : "authorization_code",
      code : code
    };

    httpsPost(accessTokenURL, obj, function(err, response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        return cb(e);
      }

      if (response.error) {
        return cb(new Error(response.error));
      }

      if (response.uid && !isNaN(response.uid)) {
        response.uid = parseInt(response.uid, 10).toString();
      } else if (!response.uid) {
        response.uid = 0;
      }

      cb(null, {
        accessToken : response.access_token.trim(),
        uid : response.uid
      });
    });
  },
  //获取微博帐号的id
  getUserId : function(accessTokenObj, cb) {
    if (accessTokenObj.uid) {
      return cb(null, accessTokenObj);
    }

    var getUidUrl = "https://api.weibo.com/2/account/get_uid.json";
    var obj = {
      access_token : accessTokenObj.accessToken
    };

    var url = formatUrl(getUidUrl, obj);

    httpsGet(url, function(err, data) {
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
  //获取微博帐号的信息
  getUserInfo : function(uid,accessToken, cb) {
    var getUidUrl = "https://api.weibo.com/2/users/show.json";
    var obj = {
      // source : WEIBO_OAUTH.APP_ID,
      access_token: accessToken,
      uid : uid
    };

    var url = formatUrl(getUidUrl, obj);

    httpsGet(url, function(err, data) {

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
  var req = https.get(url, function(res) {

    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      cb(null, data);
      data = undefined;
    });

  });
  req.on('error', function(e) {
    sails.log.error("httpGet", url, "Got error: ", e.code);
    cb(e);
  });
  req.setTimeout(20 * 1000, function() {
    req.abort();
  });
}

function httpsPost(requestUrl, data, cb) {
  requestUrl = url.parse(requestUrl);
  data = require('querystring').stringify(data);

  var opt = {
    method : "POST",
    host : requestUrl.host,
    path : requestUrl.path,
    headers : {
      "Content-Type" : 'application/x-www-form-urlencoded',
      "Content-Length" : data.length
    }
  };

  var req = https.request(opt, function(serverResult) {
    if (serverResult.statusCode === 200) {
      var body = "";
      serverResult.on('data', function(data) {
        body += data;
      }).on('end', function() {
        cb(null, body);
      });
    } else {
      cb(new Error("request data fail"));
    }
  });
  req.on('error', function(e) {
    sails.log.error("httpPost", url, "Got error: ", e.code);
    cb(e);
  });
  req.setTimeout(20 * 1000, function() {
    req.abort();
  });

  req.write(data + "\n");
  req.end();
}

module.exports = weibo;
module.exports.OPEN_PLATFORM = WEIBO_OAUTH.OPEN_PLATFORM;
