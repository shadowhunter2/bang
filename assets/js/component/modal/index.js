var avalon = require('avalon2');
require('./index.less');

module.exports = avalon.component('ms-modal', {
  template: require('text!./template.html'),
  defaults: {
    title: 'title',
    isShow: true,

    cbProxy: function(ok){

      var cbName = ok ? 'onOk' : 'onCancel';
      if(this.hasOwnProperty(cbName)){
        var ret = this[cbName]();

        if(ret !== false){
            this.isShow = false;
        }
      }
      else{
        this.isShow = false;
      }
    },

    onReady: function(){
      this.$watch('isShow', function(isShow){
        document.body.style.overflow = isShow ? 'hidden' : '';
      })
    },

    onDispose:function(){
      alert(1)
    }
  },

  soleSlot: 'content'
})