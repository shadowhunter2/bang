var createGuestUid = require('../../libs/guest-marker').createGuestUid;

exports.index = function (req, res, next) {

  var guestUid = req.cookies && req.cookies.guestUid || createGuestUid();

  res.cookie('guestUid', guestUid, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)});

  if(/\.js|\.css|\.ico|\.png|\.jpg|\.gif|\.jpeg/.test(req.url)){

    return next();

  }

  if (!req.isLogin && res.locals.UA.isWeixin) {

    return res.redirect("/user/third?name=weixin&url=" + encodeURIComponent(req.url));

  }

  res.view();

};

