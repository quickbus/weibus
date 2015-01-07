'use strict';
/* global require, console*/


var express = require('express');
var robot = require('weixin-robot');
var ruler = require('./lib/rules.js');
var path = require('path');

var app = express();


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
  res.render('detail', {
    routeName: '家乐福一号线',
    title: 'test',
    img_url: 'http://api.map.baidu.com/staticimage?center=121.42141263976,31.277594117339&width=600&height=300&zoom=18&labels=121.42141263976,31.277594117339|121.42322812422,31.278587367109|121.4248220114,31.279486673706|121.42331151952,31.281883628821|121.4190898924,31.282170973724|121.41606913506,31.285491114014|121.41305104752,31.286211259983|121.41444432377,31.28926959879|121.41677654018,31.289417835886|121.41889797416,31.289493902695|121.42017806944,31.289565582519|121.42267404255,31.286371536429|121.42471179666,31.285669218532|121.42899356061,31.28537139468|121.4293431139,31.281293078594|121.43027525584,31.277447319704|121.4294879696,31.27243368115|121.42327273135,31.269712895732|121.41769451813,31.274496915417&labelStyles=1:%E5%A4%A7%E5%8D%8E%E8%B7%AF455%E5%BC%84,1,14,0xffffff,0x000fff,1|2:%E5%A4%A7%E5%8D%8E%E4%BA%8C%E6%9D%91,1,14,0xffffff,0x000fff,1|3:%E6%96%B0%E6%B2%AA%E8%B7%AF1060%E5%BC%84,1,14,0xffffff,0x000fff,1|4:%E6%96%87%E5%8D%8E%E8%8B%91%EF%BC%88%E5%A4%A7%E5%8D%8E%E4%B8%89%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|5:%E6%BB%A8%E6%B1%9F%E9%9B%85%E8%8B%91%EF%BC%88%E5%A4%A7%E5%8D%8E%E4%B8%89%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|6:%E5%BA%B7%E5%8D%8E%E8%8B%91%EF%BC%88%E5%8D%8E%E7%81%B5%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|7:%E5%BA%B7%E5%8D%8E%E8%8B%91%EF%BC%88%E7%9C%9F%E9%87%91%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|8:738%E7%BB%88%E7%82%B9%E7%AB%99,1,14,0xffffff,0x000fff,1|9:%E8%A1%8C%E7%9F%A5%E8%B7%AF635%E5%BC%84,1,14,0xffffff,0x000fff,1|10:%E8%A1%8C%E7%9F%A5%E8%B7%AF569%E5%BC%84,1,14,0xffffff,0x000fff,1|11:%E8%A1%8C%E7%9F%A5%E8%B7%AF381%E5%BC%84,1,14,0xffffff,0x000fff,1|12:%E5%8C%97%E5%8D%8E%E8%8B%91%EF%BC%88%E5%A4%A7%E5%8D%8E%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|13:%E6%96%87%E5%8D%8E%E8%8B%91%EF%BC%88%E5%8D%8E%E7%81%B5%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|14:%E5%8D%8E%E7%81%B5%E8%B7%AF880%E5%BC%84,1,14,0xffffff,0x000fff,1|15:%E5%8D%8E%E7%81%B5%E8%B7%AF%E9%82%AE%E5%B1%80%EF%BC%88%E5%A4%A7%E5%8D%8E%E4%B8%89%E8%B7%AF%E5%8F%A3%EF%BC%89,1,14,0xffffff,0x000fff,1|16:%E5%8D%97%E5%8D%8E%E8%8B%91%EF%BC%88%E5%8D%8E%E7%81%B5%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|17:%E7%81%B5%E7%9F%B3%E8%B7%AF1669%E5%BC%84,1,14,0xffffff,0x000fff,1|18:%E4%B8%AD%E6%B5%A9%E4%BA%91%E8%8A%B1%E8%8B%91%EF%BC%88%E5%AF%8C%E5%B9%B3%E8%B7%AF%EF%BC%89,1,14,0xffffff,0x000fff,1|19:%E5%AE%B6%E4%B9%90%E7%A6%8F,1,14,0xffffff,0x000fff,1'
  });
});