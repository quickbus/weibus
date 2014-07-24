'use strict';
var formpost = require('./formpost.js');
var config = require('../config.json');
var lo = require('lodash');
var baiduapi = require('./baidu.js');


console.log(config.routes);


var picUrlCompiler = lo.template(
  'http://api.map.baidu.com/staticimage?center=<%= lng %>,<%= lat %>&' +
  'width=600&height=300&zoom=17&markers=<%= lng %>,<%= lat %>');

module.exports = function(robot) {


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
          'data[phone_num]': '13524677703',
          'datt[route_name]': 'info._route'
        })
        .then(function(reses) {
          var obj = JSON.parse(reses[1])[0];
          res = {
            gpsLat: obj.ViewUserLatestPosPhone.latitude,
            gpsLng: obj.ViewUserLatestPosPhone.longitude,
            updateAT: obj.ViewUserLatestPosPhone.modified
          };

          return baiduapi.toBaiduCoordsQ(res.gpsLng, res.gpsLat,
            'C125dcbb78c4d1e02f0404e02dd02548',
            'B3a0e39639fd1f554f475822989decd0');
        })
        .then(function(pos) {
          res.lat = pos.lat;
          res.lng = pos.lng;

          return baiduapi.getPOI(res.lng,
            res.lat, '1wpk9X6wAbE9D2pHZRYNhmLw');
        })
        .then(function(pois_info) {

          var message = {
            title: '班车最新位置 (更新时间' + res.updateAT +')',
            picUrl: picUrlCompiler(res),
            description: pois_info.address + '(' + pois_info.pois[0].name + ' 附近' + ')'
          };


          next(null, message);
        });
    }

  });


  robot.set({
    '/hi/i': function(info, next) {

      process.nextTick(function() {
        next(null, {
          title: '班车最新位置',
          url: 'http://api.map.baidu.com/marker?location=120.16702049327,30.172615381261&title=班车位置&output=html',
          picUrl: 'http://api.map.baidu.com/staticimage?center=120.16702049327,30.172615381261&width=600&height=300&zoom=18&markers=120.16702049327,30.172615381261',
          description: '班车大致位置,点击查看详情',
        });
      });
    },
    '/who (are|r) (you|u)/i': 'I\'m a robot.'
  });

  robot.set('subscribe', {
    pattern: function(info) {
      return info.is('location');
    },
    handler: function(info) {
      console.log(info.raw);
      return '欢迎订阅微信机器人';
    }
  });

  robot.set({
    pattern: function() {
      return true;
    },
    handler: function() {
      return '直接输入路线名称查询位置';
    }
  });

};
