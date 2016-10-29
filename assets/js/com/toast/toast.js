var toast = {
  DURATION_SHORT : 1500,
  DURATION_LONG : 5000,
  DURATION_ALWAYS : -1,
  DELAY_SHORT : 300,
  DELAY_LONG : 1000,
  POSITION_BOTTOM : "bottom",
  POSITION_CENTER : "cneter",

  _default : {
    text : "undefined",
    duration : 1500,
    delay : 0,
    position : "bottom"
  },
  _wait : [],
  _boxOnPag : null,
  _getClientHeight : function() {
    return document.documentElement.clientHeight;
  },
  _makePOstion : function($box, position) {
    if (typeof position === "object") {
      var follow = position.follow;
      var left = getLeft(follow) + (position.offsetLeft || 0);
      var top = getTop(follow) + (position.offectTop || 0);
      $box.css({
        position : "absolute",
        left : left,
        top : top,
        width : "auto",
        padding : "10px 16px",
        height : "40px",
        background : "#222",
        opacity : 0.8,
        textAlign : "left",
        color : "#fff",
        display : "none",
        borderRadius : "15px"
      })

    } else if (position == this.POSITION_BOTTOM) {
      $box.css({
        position : "fixed",
        width : "100%",
        height : "40px",
        background : "#222",
        opacity : 0.8,
        textAlign : "center",
        color : "#fff",
        display : "none",
        bottom : 0
      })
    } else {
      var clientHeight = this._getClientHeight();
      var cleintWidth = document.documentElement.clientWidth;
      $box.css({
        position : "fixed",
        width : "auto",
        padding : "10px 16px",
        height : "40px",
        background : "#222",
        opacity : 0.8,
        textAlign : "left",
        color : "#fff",
        display : "none",
        top : (clientHeight / 2 - 20),
        borderRadius : "15px"
      })
      setTimeout(function() {
        $box.css({
          left : (cleintWidth - $box[0].offsetWidth) / 2
        })
      }, 0)
    }
  },
  _creakeBox : function(position) {
    var $this = this;
    var $box = $("<div></div>");
    $box.css("z-index", 100);
    this._makePOstion($box, position);

    var isIE6 = UA.ie && UA.ue == 6;
    if (isIE6) {
      var _top = document.documentElement.scrollTop + document.documentElement.clientHeight - 40;
      $box.css({
        top : _top,
        position : "absolute",
        bottom : "auto",
        filter : "alpha(opacity=80)"
      })
    }
    $box.click(function() {
      $this._removeBox($box);
    })
    $("body").append($box);
    return $box;
  },
  _removeBox : function($box) {
    if ($box.isDestroy) {
      return;
    }
    var $this = this;
    $box.isDestroy = true;

    $box.fadeOut("fast", function() {
      $(this).remove();
      $this._boxOnPag = null;

      var option = $this._wait.shift();
      if (option) {
        $this.show(option);
      }
    });
  },
  _show : function($box, option) {
    var $this = this;
    $this._boxOnPag = $box;

    var _pop = function() {
      $box.fadeIn("fast", function() {
        if (option.duration > 0) {
          setTimeout(function() {
            $this._removeBox($box);
          }, option.duration)
        }
      })
      setTimeout(function() {
        var $content = $box.children();
        $content.css({
          marginTop : (($box.height() - $content.height()) / 2) + "px"
        })
      }, 0)
    }
    if (option.delay && option.delay > 0) {
      setTimeout(_pop, option.delay);
    } else {
      _pop();
    }
  },
  show : function(option) {
    if (!option) {
      return;
    }
    option = $.extend({}, this._default, option);
    var $this = this;

    if ($this._boxOnPag != null) {
      $this._wait.push(option);
      return;
    }
    var $box = this._creakeBox(option.position);
    var $content = $("<div>" + option.text + "</div>");
    $box.html($content);
    $this._show($box, option);
  },

  clear : function() {
    var $this = this;
    if ($this._wait.length > 0) {
      $this._wait.clear();
    }

    if ($this._boxOnPag != null) {
      $this._removeBox($this._boxOnPag);
    }
  }
}

module.exports = toast;
