var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');

exports.i18n = function (req, res, next) {

    var catalog = req.getCatalog(req.getLocale());
    res.setHeader('Cache-Control', "max-age=120");
    res.setHeader('Content-Type', "text/javascript");
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', hashCode(JSON.stringify(catalog)));

    res.send(catalog);
};

exports.mem = function (req, res, next) {
    var ps = req.query.ps;
    if (!ps || ps !== "melotkktv5") {
        return next();
    }
    var mem = process.memoryUsage();

    Object.keys(mem).forEach(function (k) {
        mem[k] = mem[k] / 1024 / 1024 + " MB";
    })

    res.send(mem);

}

exports.getCurrentTime = function (req, res, next) {
    var ret = {
        currentTime: new Date().getTime()
    };
    res.send(ret);
}

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
