'use strict';
var BaiduMap = require('../lib/baidu.js');
var MapImage = require('../lib/MapImage.js');
var expect = require('chai').expect;
var BaiduMapAPI = BaiduMap.BaiduMapAPI;
var route1 = require('./route1.json');
var openURL = require('open');
var MapImage = require('../lib/MapImage.js');

describe('make image for real route', function() {
  var api;
  var coords;

  before(function() {
    api = new BaiduMapAPI({
      ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
      sk: 'B3a0e39639fd1f554f475822989decd0'
    });

    coords = route1.map(function(route) {
      return {
        lng: route.ViewUserRouteDetail.station_lng,
        lat: route.ViewUserRouteDetail.station_lat
      };

    });
  });

  it('translate all coords to baidu coords', function(done) {

    api.toBaiduCoorArray(coords)
      .then(function(res) {
        res.forEach(function(o, i) {
          o.name = route1[i].ViewUserRouteDetail.station_name;
          return o;
        });

        var map = new MapImage({
          route_stations: res
        });

        var url = map.showMarker(res[3], 17);

        expect(url).to.contain('label');
        expect(url).to.contain('labelStyles');
        expect(url.length).to.below(4000);
        openURL(url, function() {
          done();
        });
      })
      .catch(done);
  });

  it('translate all coords to baidu coords with index', function(done) {

    api.toBaiduCoorArray(coords)
      .then(function(res) {
        res.forEach(function(o, i) {
          o.name = route1[i].ViewUserRouteDetail.station_name;
          return o;
        });

        var map = new MapImage({
          route_stations: res
        });

        var url = map.showMarkerWithIndex(res[4], 4, 17);

        expect(url).to.contain('label');
        expect(url).to.contain('labelStyles');
        expect(url.length).to.below(4000);
        openURL(url, function() {
          done();
        });
      })
      .catch(done);
  });

});