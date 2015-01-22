'use strict';
var formpost = require('./formpost.js');
var BaiduMap = require('../lib/baidu.js');
var BaiduMapAPI = BaiduMap.BaiduMapAPI;



var mapAPI = new BaiduMapAPI({
  ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
  sk: 'B3a0e39639fd1f554f475822989decd0'
});

var stations_api = 'http://115.29.204.94/ViewUserRouteDetails/wechat_route_station_detail';

module.exports = {

  getStations: function(routeID) {
    return formpost(
        stations_api, {
          'data[user_route_id]': routeID
        })
      .then(function(res) {

        var rawDataArray = JSON.parse(res[1]);

        return rawDataArray.map(function(item) {
          var detail = item.ViewUserRouteDetail;
          return {
            'lng': detail.station_lng,
            'lat': detail.station_lat,
            'name': detail.route_name
          };
        });
      })
      .then(function(stations) {
        return mapAPI.toBaiduCoorArray(stations)
          .then(function(res) {
            res.forEach(function(o, i) {
              o.name = stations[i].name;
            });
            return res;
          });
      });
  }
};