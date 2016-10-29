module.exports = function (req, res, next) {
  var ua = req.get('user-agent') || "", s;
  var UA = {};
  UA.ie = (s = ua.match(/(msie\s|trident.*rv:)([\d.]+)/i)) ? s[2] : false;
  UA.firefox = (s = ua.match(/firefox\/([\d.]+)/i)) ? !!s[1] : false;
  UA.chrome = (s = ua.match(/chrome\/([\d.]+)/i)) ? !!s[1] : false;
  UA.opera = (s = ua.match(/opera.([\d.]+)/i)) ? !!s[1] : false;
  UA.safari = (s = ua.match(/version\/([\d.]+).*safari/i)) ? !!s[1] : false;
  UA.android = (s = ua.match(/android/i)) ? !!s : false;
  UA.iphone = (s = ua.match(/iphone os/i)) ? !!s : false;
  UA.ipad = (s = ua.match(/ipad/i)) ? !!s : false;
  UA.ios = UA.ipad || UA.iphone;
  UA.isWeixin = (s = ua.match(/MicroMessenger/i)) ? !!s : false;
  UA.isApp = (ua.match(/kktv/i) || ua.match(/kkgame/i)) ? true : false


  res.locals.UA = UA;

  next();
};
