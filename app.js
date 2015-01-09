'use strict';
/* global require, console*/


var express = require('express');
var robot = require('weixin-robot');
var ruler = require('./lib/rules.js');
var path = require('path');
var lo = require('lodash');
var Promise = require('bluebird');
var redis = require('redis');

var qClient = Promise.promisifyAll(redis.createClient());


var app = express();


var templates = require('./lib/temmplateConfig.json');
var deitailPicUrlCompiler = lo.template(templates.detailTemplate);

ruler(robot);

robot.watch(app, {
  token: '79d08038ad8c7c921751a60f57401525',
  path: '/robot'
});


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({
  secret: 'e4069e23bc38c7388810dfd60feec6ab',
  store: new express.session.MemoryStore()
}));

app.get('/', function(req, res) {
  res.render('index', {
    title: 'this is awsowm1'
  });

});

app.enable('trust proxy');
app.listen(process.env.PORT || 3000, function() {
  console.log('robot on~');
});

app.get('/index', function(req, res) {
  res.send('index');
});

app.get('/detail', function(req, res) {
  var routeID = req.query.id || '';
  if (routeID === '') {
    res.render('error');
    return;
  }
  var key = 'route:' + routeID;

  qClient.getAsync(key).
  then(function(str) {
    var info = JSON.parse(str);
    res.render('detail', {
      routeName: info.name,
      title: info.name + '详细信息',
      img_url: deitailPicUrlCompiler(info),
      updateAT: info.updateAT,
      address: info.address,
      poi: info.poi
    });

  }).catch(function() {
    res.render('error');
  });

});