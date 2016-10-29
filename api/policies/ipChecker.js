module.exports = function (req, res, next) {

  req.clientIp = req.get('cdn-src-ip') || req.get('x-forwarded-for') || req.ip || "unknown";

  next();
};
