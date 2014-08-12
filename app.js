'use strict';
/* global require, console*/


var express = require('express');
var robot = require('weixin-robot');
var ruler = require('./lib/rules.js');

var app = express();


ruler(robot);

robot.watch(app, {
  token: '79d08038ad8c7c921751a60f57401525',
  path: '/'
});



app.use(express.logger('dev'));

app.use(express.cookieParser());
app.use(express.session({
  secret: 'e4069e23bc38c7388810dfd60feec6ab',
  store: new express.session.MemoryStore()
}));
app.enable('trust proxy');

app.listen(process.env.PORT || 3000, function() {
  console.log('robot on~');
});
