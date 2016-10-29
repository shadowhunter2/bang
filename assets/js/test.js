require('../styles/test/index.less');

var avalon = require('avalon2');
require('./component/modal');


var test_vm = avalon.define({
  $id: 'test',
  a:'aaa'
})

var modal_vm = avalon.define({
  $id: 'comp-modal',
  show: function(){
    this.config.isShow = true;
  },
  config: {
    isShow: false,
    onOk: function(){
      if(!confirm('hao?')){
        return false;
      }
    },
    title: '测试'
  }
})

module.exports = avalon;