'use strict';
var Promise = require('bluebird');
var redis = require('redis');
var MapImage = require('../lib/MapImage.js');
var BusAPI = require('../lib/BusAPI.js');
var memoFactory = require('../lib/RedisMemo.js');


var qClient = Promise.promisifyAll(redis.createClient());
var getStations = memoFactory({
  prefix:'stations:',
  client: qClient
},BusAPI.getStations);

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

        return getStations(routeID)
          .then(function(route_stations) {

            var mapImage = new MapImage({route_stations:route_stations});

            var url = mapImage.showMarker(marker);
            var nearestIndex = mapImage._nearestLabelIndex(
              marker);

            var stations = mapImage.labels.map(function(lab,
              index) {
              var cssClass;
              if (index === nearestIndex) {
                cssClass = 'station station--current';
              } else if (index > nearestIndex) {
                cssClass = 'station station--default';
              } else {
                cssClass = 'station station--passed';
              }

              return {
                name:lab.name,
                cssClass: cssClass
              };

            });
            stations[0].cssClass = 'station station--start';
            stations[stations.length - 1].cssClass =
              'station station--end';

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

          });
      }).catch(function(err) {
        console.log(err,err.stack);
        res.render('error');
      });

  });
};
