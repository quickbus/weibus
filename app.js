'use strict';
/* global require, console*/
var express = require('express');
var robot = require('weixin-robot');
var ruler = require('./lib/rules.js');
var path = require('path');
var detail = require('./route/detail.js');

var app = express();

ruler(robot);

robot.watch(app, {
  token: '79d08038ad8c7c921751a60f57401525',
  path: '/robot'
});


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger());
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({
  secret: 'e4069e23bc38c7388810dfd60feec6ab',
  store: new express.session.MemoryStore()
}));
app.use(app.router);


app.get('/', function(req, res) {
  res.render('index', {
    title: 'this is awsowm1'
  });

});


app.enable('trust proxy');

detail(app);

app.get('/index', function(req, res) {
  res.send('index');
});



var API = require('./lib/BusAPI.js');
var BaiduMapAPI = require('./lib/baidu.js').BaiduMapAPI;
var mapAPI = new BaiduMapAPI({
  ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
  sk: 'B3a0e39639fd1f554f475822989decd0'
});

app.get('/points', function(req, res) {

  var name = req.param('name');
  console.log('logs', name);
  API.getRoutePointsByName(name)
    .then(function(points) {
      return mapAPI.toBaiduCoorArray(points);
    }).then(function(baiduPoints) {
      res.json(baiduPoints);
    }, function(err) {
      res.json(500, err);
    });

});


app.listen(process.env.PORT || 3000, function() {
  console.log('robot on~');
});