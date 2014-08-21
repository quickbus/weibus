'use strict';
var formpost = require('../lib/formpost.js');
var expect = require('chai').expect;

describe('quickbus API', function() {

  it('should get Bus position by phone Number ', function(done) {

    formpost('http://42.121.133.161/ViewUserLatestPosPhones/wechat_route_latest_position',
      {'data[route_name]':'罗山路线',
      'data[phone_num]':'15216656707'})
    .then(function(reses){
      var json = JSON.parse(reses[1]);
      expect(json).has.property('ViewUserLatestPosPhone');
      done();
    }).catch(done);

  });

});
