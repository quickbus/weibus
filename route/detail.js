'use strict';
var Promise = require('bluebird');
var redis = require('redis');
var qClient = Promise.promisifyAll(redis.createClient());
var MapImage = require('../lib/MapImage.js');
var route1config = require('../lib/Route1.json');



var route1MapImage = new MapImage({
  route_stations: route1config
});


module.exports = function(app) {

  app.get('/detail', function(req, res) {
    var routeID = req.query.id || '';
    if (routeID === '') {
      res.render('error');
      return;
    }
    var key = 'route:' + routeID;

    qClient.getAsync(key)
      .then(function(str) {
        var info = JSON.parse(str);
        var url = route1MapImage.showMarker({
          lng: info.lng,
          lat: info.lat
        });
        console.log(url);
        res.render('detail', {
          routeName: info.name,
          title: info.name + '详细信息',
          img_url: url,
          updateAT: info.updateAT,
          address: info.address,
          poi: info.poi,
          product: process.env.PORT
        });

      }).catch(function(err) {
        console.log(err);
        res.render('error');
      });

  });
};