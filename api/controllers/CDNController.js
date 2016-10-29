var EventProxy = require('eventproxy');
var http = require('http');

exports.output = function (req, res, next) {

  var cacheMinute = +req.params.minute;
  var funcTag = req.params.functag;
  var params = req.params.params;

  var parameter = {
    FuncTag: funcTag,
    _cache: cacheMinute || 1
  };
  var pairs = params.split('_');

  pairs.forEach(function (pair) {
    pair = pair.split('-');
    parameter[pair[0]] = pair[1];
  });

  var client = new KKApi.Client();
  client.request(parameter, function (err, data) {
    if (err) {
      KKApiErrorCodeTranslater.translate(err);
      return res.send(err);
    }
    res.setHeader('Cache-Control', "max-age=120");
    res.setHeader('Content-Type', "text/javascript");
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', hashCode(JSON.stringify(data)));

    res.send(data);
  });

  function hashCode(str) {
    var hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (var i = 0; i < str.length; i++) {
      var character = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + character;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
};

exports.refresh = function (req, res, next) {
  var PATH = req.query.PATH;
  var DIR = req.query.DIR;
  var I = req.query.I;

  var ep = new EventProxy();
  ep.all('CDN', "CACHE", function (cdn, cache) {
    res.send("CDN = " + cdn + "<br/> cache = " + cache);
  });

  if (PATH) {
    ep.emit('CACHE');
    httpGet("http://www.kktv1.com/CDN/refresh/?HOST=www.kktv5.com&PATH=" + PATH, function (err, data) {
      ep.emit('CDN', err || data);
    });
  } else if (DIR) {
    ep.emit('CACHE');
    httpGet("http://www.kktv1.com/CDN/refresh/?HOST=www.kktv5.com&DIR=" + DIR, function (err, data) {
      ep.emit('CDN', err || data);
    });
  } else if (I) {
    httpGet("http://www.kktv1.com/CDN/refresh/?HOST=www.kktv5.com&I=" + I, function (err, data) {
      ep.emit('CDN', err || data);
    });

    fastCache.keys(I, function (err, data) {
      if (err) {
        return ep.emit('CACHE', err);
      }
      var ep2 = new EventProxy();
      ep2.after("cacheFiles", data.length, function () {
        ep.emit('CACHE', data);
      });

      data.forEach(function (key) {
        fastCache.remove(key, function () {
          ep2.emit("cacheFiles");
        });
      });

    });

  } else {
    ep.emit('CACHE');
    ep.emit('CDN');
  }
};

function httpGet(url, cb) {
  http.get(url, function (res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      cb(null, data);
      data = undefined;
    });

  }).on('error', function (e) {
    sails.log.error("httpGet", url, "Got error: ", e.message);
    cb(e);
  });
}
