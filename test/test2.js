'use strict';
var formpost = require('../lib/formpost.js');
describe('baidu apixxx', function() {

  it('should get pois ', function(done) {

    formpost('http://42.121.133.161/ViewUserLatestPosPhones/wechat_route_latest_position',
      {'data[route_name]':'罗山路线',
      'data[phone_num]':'15216656707'})
    .then(function(reses){
      console.log(reses[1]);
      done();
    });

  });

});
