'use strict';
var memofactory = require('./RedisMemo.js');
var baiduMap = require('./baidu.js');
var busAPI = require('./BusAPI.js');
var MapImage = require('./MapImage.js');
var Promise = require('bluebird');


var mapAPI = new baiduMap.BaiduMapAPI({
  ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
  sk: 'B3a0e39639fd1f554f475822989decd0'
});

var redis = require('redis'),
  qClient = Promise.promisifyAll(redis.createClient());

var getStations = memofactory({
    prefix: 'stations:',
    client: qClient
  },
  busAPI.getStations);

module.exports = function(res) {

  var key = 'route:' + res.route_id;

  return mapAPI.toBaiduCoordsQ({
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
    })
    .then(function(pois_info) {

      return getStations(res.route_id)
        .then(function(stations) {

          return new MapImage({
            route_stations: stations
          });

        }).then(function(mapImage) {

          var message = [{
            title: '点击查看 ' + res.name + ' 最新位置',
            picUrl: mapImage.showMarker(res, 17),
            description: pois_info.address + '(' + pois_info.pois[0].name +
              ' 附近' + ')' + '\n' +
              '阅读全文查看更多优惠信息',
            url: 'http://121.41.74.107/detail?id=' + res.route_id
          }, {
            title: '家乐福:什么是福？',
            picUrl: 'http://121.41.74.107/images/ads/fu_logo.png',
            description: '什么是福',
            url: 'http://121.41.74.107/ad.html'
          }];

          var cache = {
            name: res.name,
            updateAT: res.updateAT,
            lng: res.lng,
            lat: res.lat,
            address: pois_info.address,
            poi: pois_info.pois[0].name
          };

          qClient.setAsync(key, JSON.stringify(cache))
            .catch(function(e) {
              console.log('caching failed with \n', e, new Date());
            });
          return message;
        });
    });
};
