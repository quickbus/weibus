'use strict';
var BaiduMap = require('../lib/baidu.js');
var BaiduMapAPI = BaiduMap.BaiduMapAPI;
var route1 = require('./route1.json');
var openURL = require('open');


describe('make image for real route', function() {

  var api;

  before(function() {
    api = new BaiduMapAPI({
      ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
      sk: 'B3a0e39639fd1f554f475822989decd0'
    });
  })

  it('translate all coords to baidu coords', function(done) {
    var coords = route1.map(function(route) {
      return {
        lng: route.ViewUserRouteDetail.station_lng,
        lat: route.ViewUserRouteDetail.station_lat
      };

    });

    api.toBaiduCoorArray(coords)
      .then(function(res) {
        res.forEach(function(o, i) {
          o.name = route1[i].ViewUserRouteDetail.station_name;
          return o;
        });
        openURL(BaiduMap.getImageUrlx(res), function() {
          done();
        });
      })
      .catch(done);
  });
});