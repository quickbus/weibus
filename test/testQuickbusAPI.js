'use strict';
var formpost = require('../lib/formpost.js');
var expect = require('chai').expect;



describe('quickbus API', function() {

  it.skip('should get Bus position by phone Number ', function(done) {

    formpost(
        'http://115.29.204.94/ViewUserLatestPosPhones/wechat_route_latest_position', {
          'data[route_name]': '罗山路线',
          'data[phone_num]': '15216656707'
        })
      .then(function(reses) {
        console.log('logs', reses[1]);
        var json = JSON.parse(reses[1]);
        expect(json).has.property('ViewUserLatestPosPhone');
        done();
      }).catch(done);

  });

  it('should get lates passing stations', function(done) {

    formpost(
        'http://115.29.204.94/ViewRoutePassedStations/wechat_passed_stations_by_name', {
          'data[route_name]': '家乐福万里店5号班车',
          'data[minutes_elapsed]': 30
        })
      .then(function(reses) {
        var passedStations = JSON.parse(reses[1]);
        expect(passedStations.length).to.above(0);
      }).done(done);


  });

});