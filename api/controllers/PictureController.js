var fs = require('fs');
var path = require('path');
var mime = require('mime');
var UPYUN = require('../../libs/upyun-legacy/');
var http = require('http');
var url = require('url');
var _ = require('underscore');

// var IMAGE_MAX_SIZE = 5 * 1024 ;
var IMAGE_MAX_SIZE = 5 * 1024 * 1024;
var IMAGE_ALL_OWFILES = [".png", ".jpg", ".gif", ".jpeg"];
var IMAGES_TYPES = {
  "avatar": 0,
  "watermark": 8
};

var upyun = new UPYUN('kktv8', 'kkftp', 'kktv8lyl', 'v0');

var upKkIDC = {
  _getfield: function (field, value) {//postֵpayload
    return 'Content-Disposition: form-data; name="' + field + '"\r\n\r\n' + value + '\r\n';
  },
  _getfieldHead: function (field, filename) {//�ļ�payload
    var _this = this;
    var fileFieldHead = 'Content-Disposition: form-data; name="' + field + '"; filename="' + filename + '"\r\n' + 'Content-Type: ' + _this._getMime(filename) + '\r\n\r\n';
    return fileFieldHead;
  },
  _getMime: function (filename) {
    var mimes = {
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.js': 'appliction/json',
      '.torrent': 'application/octet-stream'
    };
    var ext = path.extname(filename);
    var mime = mimes[ext];
    mime = !!mime ? mime : 'application/octet-stream';
    return mime;
  },
  _getBoundary: function () {
    var max = 9007199254740992;
    var dec = Math.random() * max;
    var hex = dec.toString(36);
    var boundary = hex;
    return boundary;
  },
  _getBoundaryBorder: function (boundary) {
    return '--' + boundary + '\r\n';
  },
  _fieldPayload: function (fieldObj, boundary) {
    var _this = this;
    var payload = [];
    for (var id in fieldObj) {
      payload.push(_this._getfield(id, fieldObj[id]));
    }
    payload.push("");
    return payload.join(_this._getBoundaryBorder(boundary));
  },
  uploadFile: function (requestUrl, fileToUpload, fieldObj, cb) {
    var _this = this;
    var boundary = _this._getBoundary();//"----WebKitFormBoundary" +
    var h = _this._getBoundaryBorder(boundary);
    var e = _this._fieldPayload(fieldObj, boundary);
    var a = _this._getfieldHead("inputFile", "*.jpg");
    var d = "\r\n" + h;
    requestUrl = url.parse(requestUrl);
    var opt = {
      method: "POST",
      host: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.path,
      headers: {
        "Content-Type": 'multipart/form-data; boundary=' + boundary,
        "Content-Length": Buffer.byteLength(h + e + a + d) + fs.statSync(fileToUpload).size
      }
    };

    var req = http.request(opt, function (serverResult) {
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
      sails.log.error("httpPost", requestUrl, "Got error: ", e.code);
      cb(e);
    });
    req.setTimeout(20 * 1000, function () {
      req.abort();
    });

    req.write(h + e + a);//log.diy(h+e+a+buffer+d);
    if (fileToUpload && fs.existsSync(fileToUpload)) {
      var rs = fs.createReadStream(fileToUpload);
      rs.pipe(req, {end: false});
      rs.on('close', function () {
        req.end(d);
      });
    } else if (fileToUpload) {
      req.write(fileToUpload);
      req.end(d);
    } else {
      req.end(d);
    }
  }
};


exports.saveToUpyun = function (req, res, next) {
  // if (!req.isLogin) {
  //   return next();
  // }

  if (req.method.toLowerCase() !== "post") {
    return res.send(400);
  }

  var typeName = req.param("typeName");
  var files = req.file("inputFile");

   var picture = KKApi.Client.Picture({
    userId:req.param('userId'),
    token:req.param('token')
  });

  var clientData = {};

  async.waterfall([
    function (cb) {
      files.upload(function (err, images) {
        if (err) {
          return cb(err);
        }

        var image = images[0];

        if (images.length !== 1) {
          images.forEach(function (image) {
            fs.unlink(image.fd);
          });
          return cb('只能上传一张图片');
        }

        var imgExt = path.extname(image.fd).toLowerCase();
        if (!~IMAGE_ALL_OWFILES.indexOf(imgExt)) {
          fs.unlink(image.fd);
          return cb('只能上传图片');
        }

        if (image.size > IMAGE_MAX_SIZE) {
          fs.unlink(image.fd);
          return cb('照片大小超出限制');
        }

        image.ext = imgExt;

        return cb(null, image);
      });
    },
    function (image, cb) {
      var pictureTYpe = IMAGES_TYPES[typeName];
      picture.getUpyunUploadParams({
        pictureType: 3,
        localUrl: "*" + image.ext
      }, function (err, data) {
        clientData = _.extend(data);
        return cb(err, image, data);
      });
    },
    function (image, data, cb) {
      var upyunPath = data.url;
      var basename = path.basename(image.fd);
      var mimeType = mime.lookup(basename);

      upyun.uploadFile(upyunPath, image.fd, mimeType, function (err, result) {
        fs.unlink(image.fd);
        cb(err, result, data.url);
      });
    }
  ], function (err, data) {
    if (err) {
      return res.send({errMsg: err});
    }
    else {
      return res.send(clientData);
    }
  });
};

exports.saveToKKIDC = function (req, res, next) {
  var seId = req.body && req.body.seId;
  seId = seId && kkUtils.sd(seId);

  if (seId) {
    try {
      seId = JSON.parse(seId);
    } catch (e) {
      return next();
    }
  }

  if (req.isLogin) {
    var simpleProfile = req.session.profile.simple
  } else if (seId) {
    var simpleProfile = seId;
  } else {
    return next();
  }

  if (req.method.toLowerCase() !== "post") {
    return res.send(400);
  }

  var typeName = req.param("typeName");
  var files = req.file("inputFile");

  var picture = KKApi.Client.Picture(simpleProfile);

  async.waterfall([
    function (cb) {
      files.upload(function (err, images) {
        if (err) {
          return cb(err);
        }

        if (images.length !== 1) {
          images.forEach(function (image) {
            fs.unlink(image.fd);
          });
          return cb(new Error("too many files uploaded"));
        }

        var image = images[0];

        if (image.size > IMAGE_MAX_SIZE) {
          fs.unlink(image.fd);
          return cb(new Error('file size too large'));
        }

        var imgExt = path.extname(image.fd).toLowerCase();
        if (!~IMAGE_ALL_OWFILES.indexOf(imgExt)) {
          fs.unlink(image.fd);
          sails.log.error('upload file type invalid , type is ',imgExt);
          return cb(new Error('file type invalid'));
        }
        image.ext = imgExt;

        return cb(null, image);
      });
    },
    function (image, cb) {
      var pictureTYpe = IMAGES_TYPES[typeName];
      picture.getUploadURL({
        pictureType: 3
      }, function (err, data) {
        return cb(err, image, data);
      });
    },
    function (image, data, cb) {
      var uploadPath = data.url;
      var basename = path.basename(image.fd);
      var mimeType = mime.lookup(basename);

      uploadPath = uploadPath.replace("res01.kktv1.com", "192.168.100.2");

      upKkIDC.uploadFile(uploadPath, image.fd, {}, function (err, result) {
        fs.unlink(image.fd);
        cb(err, result, data.url);
      });
    }
  ], function (err, data, uploadUrl) {
    if (err) {
      return res.send({errMsg: err.message, uploadUrl: uploadUrl});
    }
    else {
      return res.send(data);
    }
  });
};

