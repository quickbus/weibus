'use strict';
var formpost = require('./formpost.js');
var config = require('../config.json');
var lo = require('lodash');
var baiduapi = require('./baidu.js');
// var iconv = require('iconv-lite');

console.log(config.routes);

var picUrlCompiler = lo.template(
  'http://api.map.baidu.com/staticimage?center=<%= lng %>,<%= lat %>&' +
  'width=600&height=300&zoom=17&markers=<%= lng %>,<%= lat %>');

module.exports = function(robot) {

  var phoneReg = /^[0-9]{11}$/;

  robot.waitRule('chooseRoute', [{
      pattern: /^\d+$/,
      handler: function(info, next) {
        console.log('here');
        next(null, 'waitRule');
      }
    }, 
    {
      pattern: /.*/,
      handler: function(info, next) {
        // rebot.
        
        next(null, 'ok');
      }
    }]
  );


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
        info.session = {};
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

        // console.log(info.wait);

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
    console.log(info._route);

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
              updateAT: obj[i].ViewUserLatestPosPhone.modified
            };

            return baiduapi.toBaiduCoordsQ(res.gpsLng, res.gpsLat,
              'C125dcbb78c4d1e02f0404e02dd02548',
              'B3a0e39639fd1f554f475822989decd0');
          }
        }

        console.log('boops');
        throw Error('NO DATA');

      })
      .then(function(pos) {
        res.lat = pos.lat;
        res.lng = pos.lng;

        return baiduapi.getPOI(res.lng,
          res.lat, '1wpk9X6wAbE9D2pHZRYNhmLw');
      })
      .then(function(pois_info) {

        var message = {
          title: info._route + ' 最新位置 (更新时间' + res.updateAT + ')',
          picUrl: picUrlCompiler(res),
          description: pois_info.address + '(' + pois_info.pois[0].name + ' 附近' + ')'
        };

        next(null, message);
      }).error(function(e) {
        console.log(e);
        next(null, '暂无信息');

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
    var reply = '直接输入路线名称查询位置\n' +
      '当前路线';

    for (var i = 0, l = config.routes.length; i < l; i++) {
      reply += config.routes[i] + '\n';
    }

    return reply;
  }
});

};