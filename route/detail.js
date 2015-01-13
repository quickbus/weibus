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
        var marker = {
          lng: info.lng,
          lat: info.lat
        };
        var url = route1MapImage.showMarker(marker);

        var nearestIndex = route1MapImage._nearestLabelIndex(marker);

        var stations = route1MapImage.labels.map(function(lab, index) {
          var cssClass;
          if (index === nearestIndex) {
            cssClass = 'station station--current';
          } else if (index > nearestIndex) {
            cssClass = 'station station--default';
          } else {
            cssClass = 'station station--passed';
          }

          return {
            name: (index + 1) + ':' + lab.name,
            cssClass: cssClass
          };

        });
        stations[0].cssClass = 'station station--start';
        stations[stations.length - 1].cssClass = 'station station--end';

        res.render('detail', {
          routeName: info.name,
          title: info.name + '详细信息',
          img_url: url,
          stations: stations,
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