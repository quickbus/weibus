'use strict';
var formpost = require('./formpost.js');
var config = require('../config.json');
var baiduMap = require('./baidu.js');
var memofactory = require('./RedisMemo.js');
var busAPI = require('./BusAPI.js');
var MapImage = require('./MapImage.js');


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


var assembleMessage = function(res) {

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
              title: res.name + ' 最新位置 (更新时间' + res.updateAT + ')',
              picUrl: mapImage.showMarker(res, 17),
              description: pois_info.address + '(' + pois_info.pois[0].name +
                ' 附近' + ')' + '\n' +
                '阅读全文查看更多优惠信息',
              url: 'http://121.41.74.107/detail?id=' + res.route_id
            }, {
              title: '家乐福万里优惠信息',
              picUrl: 'http://121.41.74.107/images/ads/small_log.png',
              description: '什么是福',
              url: 'http://121.41.74.107/detail?id=' + res.route_id
            },

          ];

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

module.exports = function(robot) {

  var phoneReg = /^[0-9]{11}$/;

  robot.waitRule('chooseRoute', [{
    pattern: /^\d+$/,
    handler: function(info, next) {

      var routes = info.session.route_info;
      var idx = parseInt(info.text) - 1;
      var res = null;

      if (idx >= 0 && idx < routes.length) {
        res = {
          route_id: routes[idx].ViewUserLatestPosPhone.user_route_id,
          gpsLat: routes[idx].ViewUserLatestPosPhone.latitude,
          gpsLng: routes[idx].ViewUserLatestPosPhone.longitude,
          updateAT: routes[idx].ViewUserLatestPosPhone.modified,
          name: routes[idx].ViewUserLatestPosPhone.route_name
        };
        return assembleMessage(res)
          .then(function(message) {
            info.resolve();
            next(null, message);
          })
          .catch(function(e) {

            console.log('error', e, res);
            info.resolve();
            next(null, '咦怎么没有信息\n好像服务器出问题了 :(\n' +
              '待会再来试试吧~');
          });
      } else {
        info.rewait();
        return next(null, '请输入 1~' + routes.length);
      }
    }
  }, {
    pattern: /.*/,
    handler: function(info, next) {
      var routes = info.session.route_info;
      next(null, '请输入 1~' + routes.length);
    }
  }]);

  robot.set('dialog start by phone number', {
    pattern: function(info) {
      var phoneNumStr = info.text || '';
      return phoneReg.test(phoneNumStr.trim());
    },
    handler: function(info, next) {

      formpost(
          'http://115.29.204.94/ViewUserLatestPosPhones/wechat_passenger_inquiry', {
            'data[phone_num]': info.text.trim()
          })
        .then(function(resandbody) {
          var body = JSON.parse(resandbody[1]);
          var routesChoices;
          if (body.length === 0) {
            next(null, '该手机号码未在quickbus.com注册');
            return;
          }

          routesChoices = body.map(function(item, index) {
            var order = index + 1;
            return '' + order.toString() + ':' + item.ViewUserLatestPosPhone
              .route_name;
          });
          var reply = '输入数字选择线路\n' + routesChoices.join('\n');
          info.session.route_info = body;

          info.wait('chooseRoute');

          next(null, reply);
        });
    }
  });

  robot.set('query by nick name direct', {
    pattern: function(info) {
      var line = info.text;
      line = line && line.trim();
      for (var i = 0, l = config.routes.length; i < l; i++) {
        if (config.routes[i].indexOf(line) !== -1) {
          info._route = config.routes[i].split(': ')[1];
          return true;
        }
      }
      return false;
    },
    handler: function(info, next) {
      var res = {};
      formpost(
          'http://115.29.204.94/ViewUserLatestPositions/wechat_latest_position_by_name', {
            'data[route_name]': info._route
          })
        .then(function(reses) {
          var obj = JSON.parse(reses[1]);
          if (Array.isArray(obj) && obj.length === 0) {
            throw Error('Bus:nodata');
          }

          res = {
            route_id: obj.ViewUserLatestPosition.user_route_id,
            gpsLat: obj.ViewUserLatestPosition.latitude,
            gpsLng: obj.ViewUserLatestPosition.longitude,
            updateAT: obj.ViewUserLatestPosition.created,
            name: obj.ViewUserLatestPosition.name
          };
          return res;
        })
        .then(function(res) {
          return assembleMessage(res);
        }, function(error) {
          if (error.message === 'Bus:nodata') {
            return '暂时没有班车信息';
          } else {
            throw error;
          }
        })
        .then(function(message) {
          next(null, message);
        })
        .catch(function(e) {
          console.log(e, e.stack);
          next(null, '咦怎么没有信息\n好像服务器出问题了 :(');
        });
    }
  });


  robot.set('subscribe', {
    pattern: function(info) {
      return info.is('event') && info.param.event === 'subscribe';
    },
    handler: function() {
      return '欢迎订阅 -家乐福班车助手-\n' +
        '输入？我来教你怎么用';
    }
  });

  robot.set({
    pattern: function() {
      return true;
    },
    handler: function() {
      var reply = '当前可查路线:\n';

      for (var i = 0, l = config.routes.length; i < l; i++) {
        reply += config.routes[i] + '\n';
      }

      reply += '输入路线名称或者编号查询(如:1)\n';

      return reply;
    }
  });

};
