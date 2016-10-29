"use strict";

var KEY = "kktv8";
//http://pull-g.kktv8.com
var DOMAIN = "kbpull.kktv8.com";
var GAME_DOMAIN = "kbpull.kktv8.com";
var CX_DOMAIN = "hpull.kktv8.com";
var POINT = "/livekktv/";

var url = require('url');
var crypto = require("crypto");

var VideoCDNResult = function videoCDNResult(url, expireAfter) {
  this.url = url;
  this.expireAfter = expireAfter;
};
VideoCDNResult.prototype.toString = function () {
  return this.url;
};

var md5 = function (str) {
  if (str == undefined) {
    return "";
  }
  var md5 = crypto.createHash("md5");
  return md5.update(str).digest("hex");
};

var STREAM_TYPE = {
  FLV: 0,
  RTMP: 1,
  M3U8: 2
}

var signURI = function (uri, time) {
  if (url == undefined || time == undefined) {
    return "";
  }
  var plaintext = KEY + uri + time;
  return md5(plaintext);
};

var buildPullStreamUrlByRoomId = function (roomId, streamType,roomSource) {
  if (roomId == undefined) {
    return roomId;
  }

  streamType = streamType || STREAM_TYPE.FLV;
  streamType = typeof streamType === 'string' ? STREAM_TYPE[streamType.toUpperCase()] : streamType;

  var time = Math.floor(Date.now() / 1000) - 60 * 2, suffix, path, protocol;

  switch (streamType) {
    default:
    case STREAM_TYPE.FLV:
      protocol = "http";
      suffix = ".flv";
      break
    case STREAM_TYPE.M3U8:
      protocol = "http";
      suffix = "/playlist.m3u8";
      break;
    case  STREAM_TYPE.RTMP :
      protocol = "rtmp";
      suffix = "";
  }

  path = POINT + roomId + suffix;

  var query = {
    wsTime: time,
    wsSecret: signURI(path, time)
  };
  var pullUrl = url.format({
    protocol: protocol,
    slashes: true,
    // host: DOMAIN,
    host: roomSource == KKApi.Client.User.roomSource.GAME ? GAME_DOMAIN : CX_DOMAIN,
    pathname: path,
    query: query
  });

  var expireAfter = (time + 60 * 5) * 1000 - Date.now();
  return new VideoCDNResult(pullUrl, expireAfter);
}


exports.buildPullStreamUrlByRoomId = buildPullStreamUrlByRoomId;
