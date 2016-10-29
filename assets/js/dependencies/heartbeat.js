// require('jquery.cookies.min.js');

var HEAT_RECORD = "heat_record";
var HEAT_TIME_SPACING = 8 * 60 * 1000;
var milliseconds = parseInt(Math.random() * 59 + 60, 10) * 1000;
function sendHeat() {
  setTimeout(sendHeat, milliseconds);

  var d = new Date().getTime();
  var record = $.cookies.get(HEAT_RECORD);

  var spacing = d - record;

  //log("now:" + d + ",last:" + record + ",spacing:" + spacing);

  if (typeof record == "number") {
    if (spacing < HEAT_TIME_SPACING) {
      return //log("duplicate");
    }
  }

  $.cookies.set(HEAT_RECORD, d, {
    domain : document.domain,
    path : '/'
  });

  $.get("/user/heartbeat/?r=" + d);
}

$(function() {
  profile.ready(function() {
    this.isLogin && setTimeout(sendHeat, milliseconds);
  });
});

