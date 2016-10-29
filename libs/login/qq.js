var https = require('https');

var QQ_OAUTH = {
	APP_ID : 101180105,
	APP_KEY : "a65db7783bfe193431450cd857082ada",
	OPEN_PLATFORM : 1
};

var qq = {
	buildRequestUrl : function buildQQRequest(redirectUrl) {
		var obj = {
			client_id : QQ_OAUTH.APP_ID,
			redirect_uri : "http://www.kktv5.com" + (redirectUrl || "/user/qq_callback/"),
			scope : "get_user_info,add_share,list_album,add_album,upload_pic,add_topic,add_one_blog,add_weibo",
			state : Math.floor(Math.random() * 100000000000) + new Date().getTime(),
			response_type : "code"
		};

		var getAuthCodeUrl = "https://graph.qq.com/oauth2.0/authorize";
		return formatUrl(getAuthCodeUrl, obj);
	},
	getAccessToken : function(code, cb) {
		var obj = {
			grant_type : "authorization_code",
			client_id : QQ_OAUTH.APP_ID,
			redirect_uri : "http://www.kktv5.com/user/qq_callback/",
			client_secret : QQ_OAUTH.APP_KEY,
			code : code
		};
		var getAccessTokenUrl = "https://graph.qq.com/oauth2.0/token";

		var url = formatUrl(getAccessTokenUrl, obj);

		httpsGet(url, function(err, data) {
			if (err) {
				return cb(err);
			}
			var accessToken = data.substring(data.indexOf("=") + 1, data.indexOf("&"))
			if (!accessToken) {
				return cb(new Error("lost access token"));
			}
			return cb(null, {
				accessToken : accessToken
			});
		});
	},
	getOpenId : function getOpenId(accessTokenObj, cb) {
		var obj = {
			access_token : accessTokenObj.accessToken,
		};

		var getOpenidUrl = "https://graph.qq.com/oauth2.0/me";
		var url = formatUrl(getOpenidUrl, obj);

		httpsGet(url, function(err, data) {
			if (err) {
				return cb(err);
			}

			if (data.indexOf("callback") >= 0) {
				data = data.substring(data.indexOf("(") + 1, data.lastIndexOf(')'));
			}
			try {
				data = JSON.parse(data);
			} catch (e) {
				return cb(e);
			}
			return cb(null, data);
		});
	},
	getUserInfo : function(openid, accessToken, cb) {
		var obj = {
			oauth_consumer_key : QQ_OAUTH.APP_ID,
			access_token : accessToken,
			openid : openid
		};

		var getUserInfo = "https://graph.qq.com/user/get_user_info";
		var url = formatUrl(getUserInfo, obj);

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

module.exports = qq;
module.exports.OPEN_PLATFORM = QQ_OAUTH.OPEN_PLATFORM;
