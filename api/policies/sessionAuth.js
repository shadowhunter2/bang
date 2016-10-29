module.exports = function (req, res, next) {
    req.isLogin = req.session && !!req.session.profile;
    res.locals.isLogin = req.isLogin;

    next();

};
