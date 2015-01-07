'use strict';
var formpost = require('./formpost.js');
var config = require('../config.json');
var lo = require('lodash');
var baiduMap = require('./baidu.js');

var mapAPI = new baiduMap.BaiduMapAPI({
  ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
  sk: 'B3a0e39639fd1f554f475822989decd0'
});


var picUrlCompiler = lo.template(
  'http://api.map.baidu.com/staticimage?center=<%= lng %>,<%= lat %>&' +
  'width=600&height=300&zoom=17&markers=<%= lng %>,<%= lat %>');

var assembleMessage = function(res) {

  return mapAPI.toBaiduCoordsQ({
      lng: res.gpsLng,
      lat: res.gpsLat
    })
    .then(function(pos) {
      res.lat = pos.lat;
      res.lng = pos.lng;

      return mapAPI.getPOI({
        lng:pos.lng,
        lat:pos.lat});
    })
    .then(function(pois_info) {
      var message = {
        title: res.name + ' 最新位置 (更新时间' + res.updateAT + ')',
        picUrl: picUrlCompiler(res),
        description: pois_info.address + '(' + pois_info.pois[0].name + ' 附近' + ')' + '\n' +
          '阅读全文查看更多优惠信息',
        url: 'http://121.41.74.107/detail'
      };
      return message;
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

            console.log('error', e,res);
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

  robot.set({
    pattern: function(info) {
      var phoneNumStr = info.text || '';

      return phoneReg.test(phoneNumStr.trim());
    },
    handler: function(info, next) {

      formpost('http://42.121.133.161/ViewUserLatestPosPhones/wechat_passenger_inquiry', {
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
            return '' + order.toString() + ':' + item.ViewUserLatestPosPhone.route_name;
          });
          var reply = '输入数字选择线路\n' + routesChoices.join('\n');
          info.session.route_info = body;

          info.wait('chooseRoute');

          next(null, reply);
        });
    }
  });

  robot.set({
    pattern: function(info) {
      var line = info.text;
      for (var i = 0, l = config.routes.length; i < l; i++) {
        if (config.routes[i].indexOf(line) !== -1) {
          info._route = config.routes[i];
          return true;
        }
      }
      return false;
    },

    handler: function(info, next) {
      var res = {};
      formpost('http://42.121.133.161/ViewUserLatestPosPhones/wechat_passenger_inquiry', {
          'data[phone_num]': '13524677703'
        })
        .then(function(reses) {
          var obj = JSON.parse(reses[1]);
          for (var i = 0, l = obj.length; i < l; i++) {
            if (obj[i].ViewUserLatestPosPhone.route_name === info._route) {
              res = {
                gpsLat: obj[i].ViewUserLatestPosPhone.latitude,
                gpsLng: obj[i].ViewUserLatestPosPhone.longitude,
                updateAT: obj[i].ViewUserLatestPosPhone.modified,
                name: obj[i].ViewUserLatestPosPhone.route_name
              };
              return res;
            }
          }
          throw Error('NO DATA');
        })
        .then(function(res) {
          return assembleMessage(res);
        })
        .then(function(message) {
          next(null, message);
        })
        .catch(function(e) {
          console.log(e);
          next(null, '咦怎么没有信息\n好像服务器出问题了 :(');
        });
    }
  });

  robot.set({
    '/who (are|r) (you|u)/i': 'I\'m a robot.'
  });

  robot.set('subscribe', {
    pattern: function(info) {
      return info.is('location');
    },
    handler: function() {
      return '欢迎订阅微信机器人';
    }
  });

  robot.set({
    pattern: function() {
      return true;
    },
    handler: function() {
      var reply = '直接输入路线名称查询位置\n' +
        '当前路线';

      for (var i = 0, l = config.routes.length; i < l; i++) {
        reply += config.routes[i] + '\n';
      }

      return reply;
    }
  });

};