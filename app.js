/* global require, process, console*/

'use strict';

var express = require('express');
var robot = require('weixin-robot');

var app = express();

// var robot = new webot.Webot();
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


robot.watch(app, {
  token: '79d08038ad8c7c921751a60f57401525',
  path: '/', // 这个path不能为之前已经监听过的path的子目录
});

app.use(express.logger('dev'));

app.listen(80, function() {
  console.log('robot on~');
});
