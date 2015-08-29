'use strict';
var formpost = require('./formpost.js');
var config = require('../config.json');

var assembleMessage = require('./Messager.js');

var toPromote = function (routes) {
  var header = '输入数字选择线路\n';
  return header + routes.join('\n');
};

var matchRoute = function (line, routes) {

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if (route.indexOf(line) >= 0) {
      return route.splite(': ')[1];
    }
  }

};

module.exports = function (robot) {
  robot.set('click_promotion', {
    pattern: function (info) {
      return info.type === 'event' &&
        info.param.event === 'CLICK' &&
        info.param.eventKey === 'V_PROMOTION';
    },
    handler: function (info, next) {
      next(null, '回复今日特惠信息');
    }
  });

  robot.set('click_select_shop', {
    pattern: function (info) {
      return info.type === 'event' &&
        info.param.event === 'CLICK' &&
        info.param.eventKey.index('SHOP_');
    },
    handler: function (info, next) {
      info.wait('chooseRoute');
      var shop = info.param.eventKey;
      var routes = config[shop];
      info.session.shop = shop;
      next(null, toPromote(routes));
    }
  });



  robot.waitRule('chooseRoute', [{
    pattern: /^\d+$/,
    handler: function (info, next) {
      var shop = info.session.shop;
      var routes = config[shop];
      var line = info.text.trim();
      var route = matchRoute(line, routes);
      var res = {};

      formpost(
          'http://115.29.204.94/ViewUserLatestPositions/wechat_latest_position_by_name', {
            'data[route_name]': route
          })
        .then(function (reses) {
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
        .then(function (res) {
          return assembleMessage(res);
        }, function (error) {
          if (error.message === 'Bus:nodata') {
            return '暂时没有班车信息';
          } else {
            throw error;
          }
        })
        .then(function (message) {
          next(null, message);
        })
        .catch(function (e) {
          console.log(e, e.stack);
          next(null, '咦怎么没有信息\n好像服务器出问题了 :(');
        });
    }
  }, {
    pattern: /.*/,
    handler: function (info, next) {
      var shop = info.session.shop;
      var routes = config[shop];
      next(null, '请输入 1~' + routes.length);
    }
  }]);

  robot.set('subscribe', {
    pattern: function (info) {
      return info.is('event') && info.param.event === 'subscribe';
    },
    handler: function () {
      return '欢迎订阅 -家乐福班车助手-\n' +
        '输入？我来教你怎么用';
    }
  });

  robot.set({
    pattern: function () {
      return true;
    },
    handler: function () {
      var reply = '当前可查路线:\n';

      for (var i = 0, l = config.routes.length; i < l; i++) {
        reply += config.routes[i] + '\n';
      }

      reply += '输入路线名称或者编号查询(如:5)\n';
      reply += '我们正在添加更多班车路线\n敬请期待';

      return reply;
    }
  });
};
