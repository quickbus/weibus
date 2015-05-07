'use strict';
var memofactory = require('./RedisMemo.js');
var baiduMap = require('./baidu.js');
var Promise = require('bluebird');
var formpost = require('./formpost.js');
var generateStaticMap = require('../lib/staticMap.js');

var mapAPI = new baiduMap.BaiduMapAPI({
  ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
  sk: 'B3a0e39639fd1f554f475822989decd0'
});

var redis = require('redis'),
  qClient = Promise.promisifyAll(redis.createClient());

var getPassedStations = memofactory({
  prefix: 'passed',
  client: qClient,
  expire: 60
}, function(name) {

  return formpost(
      'http://115.29.204.94/ViewRoutePassedStations/wechat_passed_stations_by_name', {
        'data[route_name]': name,
        'data[minutes_elapsed]': 30
      })
    .then(function(reses) {

      var passedStations = JSON.parse(reses[1]);
      if (passedStations.length === 0) {
        return -1;
      }

      return parseInt(passedStations[0]
        .ViewRoutePassedStation
        .station_sequence) - 1;
    }, function() {
      return -1;
    });
});

module.exports = function(res) {

  var key = 'route:' + res.route_id;
  res.routeId = res.route_id;

  var poiInfoPromise = mapAPI.toBaiduCoordsQ({
      lng: res.gpsLng,
      lat: res.gpsLat
    })
    .then(function(pos) {
      res.lat = pos.lat;
      res.lng = pos.lng;

      return mapAPI.getPOI({
        lng: pos.lng,
        lat: pos.lat
      });
    });

  var mapImagePromise = generateStaticMap({
    id: res.route_id,
    name: res.name
  });

  return Promise.all([poiInfoPromise, mapImagePromise,
      getPassedStations(res.name)
    ])
    .then(function(args) {
      var poiInfo = args[0];
      var mapImage = args[1];
      var passedStationsIndex = args[2] || -1;

      mapImage.width(360)
        .height(200)
        .zoomTo(17)
        .centerTo(res);

      if (passedStationsIndex === -1) {
        mapImage.showMarker(res, 17);
      } else {
        mapImage.showMarkerWithIndex(res, passedStationsIndex);
      }

      var message = [{
        title: '点击查看 ' + res.name + ' 最新位置',
        picUrl: mapImage.toURL(),
        description: poiInfo.address + '(' + poiInfo.pois[
            0].name +
          ' 附近' + ')' + '\n' +
          '阅读全文查看更多优惠信息',
        url: 'http://121.41.74.107/detail?id=' + res.route_id
      }, {
        title: '家乐福给您送“福”啦！快快戳我抢“福”吧！',
        picUrl: 'http://121.41.74.107/images/ads/fu_logo.png',
        description: '什么是福',
        url: 'http://121.41.74.107/ad.html'
      }];

      var cache = {
        name: res.name,
        updateAT: res.updateAT,
        lng: res.lng,
        lat: res.lat,
        address: poiInfo.address,
        poi: poiInfo.pois[0].name
      };

      qClient.setAsync(key, JSON.stringify(cache))
        .catch(function(e) {
          console.log('caching failed with \n', e, new Date());
        });
      return message;

    });
};