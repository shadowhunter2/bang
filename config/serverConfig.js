var SERVER_GROUP = {
  DEBUG : {
    API_SERVER : "http://10.0.0.105:9191/kkgame/entrance",
    JS_API_SERVER : "http://10.0.0.105:9191/kkgame/entrance",
    CDN_SERVER : "/CDN/output",
    CENTRAL_SERVER_ADDRESS : "http://10.0.0.23:20000"
  },
  RELEASE : {
    API_SERVER : "http://apikg.kktv1.com:8080/kkgame/entrance",
    JS_API_SERVER : "http://apikg.kktv1.com:8080/kkgame/entrance",
    CDN_SERVER : "/CDN/output",
    CENTRAL_SERVER_ADDRESS : "http://igame.kktv5.com"
  },
  GRAYSCALE : {
    API_SERVER : "http://sandkg.kktv1.com:8080/kkgame/entrance",
    JS_API_SERVER : "http://sandkg.kktv1.com:8080/kkgame/entrance",
    CDN_SERVER : "/CDN/output",
    CENTRAL_SERVER_ADDRESS : "http://igame.kktv5.com"
  }
};
//SERVER_GROUP.RELEASE.CENTRAL_SERVER_ADDRESS = "http://192.168.100.7:90";
//SERVER_GROUP.RELEASE.API_SERVER = "http://apikg.kktv1.com:8080/kkgame/entrance";

// module.exports.serverConfig = SERVER_GROUP.DEBUG ;
module.exports.serverConfig = SERVER_GROUP.RELEASE ;
// module.exports.serverConfig = SERVER_GROUP.GRAYSCALE ;
