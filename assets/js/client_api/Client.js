var KKApi = require('./KKApi.js'),
    securityPlugin = require('../../../api/services/client/securityPlugin.js');

(function (Parent) {
    Parent = Parent || new Function();
    var hasProp = {}.hasOwnProperty
    var Client = (function (API_URL, CDN_URL) {
        function Client() {
            if (!(this instanceof Prop)) {
                throw new Error("The 'new' modifier is missing");
            }
        }

        Client.prototype = Object.create(Parent.prototype);

        Client.prototype.API_URL = API_URL;
        Client.prototype.CDN_URL = CDN_URL;
        Client.prototype.isCallbackSuccess = function (data) {
            if (!data) {
                return false;
            }
            return data.TagCode === '00000000';
        }
        Client.prototype.formatCDNParameter = function (json, m) {
            var apiName, key, str, val;
            apiName = json["FuncTag"];
            m = m || this.CACHE_CATALOG.M1440;
            delete json["FuncTag"];
            strList = [];
            for (key in json) {
                if (!hasProp.call(json, key))
                    continue;
                val = json[key];
                strList.push(key + "-" + val);
            }
            var str = strList.join('_');
            return "/M/" + m + "/I/" + apiName + "/P/" + str + "/json.js";
        };

        Client.prototype.request = function (parameter, cb) {
            var deferred = $.Deferred();

            var dataResultDefered = function (err, result) {
                var a = cb instanceof Function && cb(err, result);
                if (err) {
                    return deferred.reject(err);
                }
                deferred.resolve(result);
            };

            if (typeof parameter !== 'object') {
                throw new Error('Illegal Argument Exception');
            }
            parameter.platform = parameter.platform || this.PLATFORM.WEB;
            parameter.a = parameter.a || this.A;
            parameter.c = parameter.c || this.C;

            var isJSONP = !parameter._cache;
            var isCDN = !!parameter._cache;
            var CDNMinute = parameter._cache;
            delete parameter._cache;

            var parameterString = isJSONP && "parameter=" + (JSON.stringify(parameter));
            var host = isCDN ? this.CDN_URL + this.formatCDNParameter(parameter, CDNMinute) : this.API_URL;

            this.postDataToServer(host, parameterString, isJSONP, function (err, data) {
                if (err) {
                    if (err.name === "timeout") {
                        var _e = new APIError(APIError.TIMEOUT_ERROR, parameter.FuncTag);
                        _e.pro = err;
                        log.error(_e);
                        return dataResultDefered(_e);
                    } else {
                        var _e = new APIError(APIError.SYSTEM_ERROR, parameter.FuncTag);
                        _e.pro = err;
                        log.error(_e);
                        return dataResultDefered(_e);
                    }

                }

                if (this.isCallbackSuccess(data)) {
                    dataResultDefered(null, data);
                } else {
                    var _e = new APIError(APIError.REQUEST_ERROR, parameter.FuncTag);
                    _e.detail = data.TagCode;
                    log.error(_e);
                    return dataResultDefered(_e);
                }
            }.bind(this));

            return deferred.promise();
        };

        Client.prototype.mixArguments = function (parameter, cb) {
            if (arguments.length === 1 && parameter instanceof Function) {
                cb = parameter;
                parameter = undefined;
            }
            cb = typeof cb == 'function' ? cb : new Function();
            parameter = parameter || {};

            return {
                parameter: parameter,
                cb: cb
            };
        };

        Client.prototype.CACHE_CATALOG = {
            M1: 1,
            M3: 3,
            M10: 10,
            M30: 30,
            M180: 180,
            M1440: 1440
        };

        var APIError = (function () {
            function APIError(name, params) {
                if (!(this instanceof  APIError)) {
                    return new APIError(name, params);
                }
                this.name = name || APIError.UNKNOWN_ERROR;
                this.params = params;
            }

            APIError.prototype = Object.create(Error.prototype);

            APIError.SYSTEM_ERROR = "System Error";
            APIError.TIMEOUT_ERROR = "Timeout Error";
            APIError.REQUEST_ERROR = "Request Error";
            APIError.UNKNOWN_ERROR = "Unknown Error";

            return APIError;
        })();

        Client.APIError = APIError;

        return Client;


    })(clientServerConfig.SERVER.API_SERVER, clientServerConfig.SERVER.CDN_SERVER);

    Parent.Client = Client;
    securityPlugin && securityPlugin(Client.prototype);

    clientServerConfig.API_NAMES.forEach(function (apiName) {
        var api = require('../../../api/services/client/apis/' + apiName + '.js');
        Client[apiName] = api(Client);
    });

    module.exports = Client;

})(KKApi);
