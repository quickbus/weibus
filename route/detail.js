'use strict';
var Promise = require('bluebird');
var redis = require('redis');
var memoFactory = require('../lib/RedisMemo.js');
var formpost = require('../lib/formpost.js');
var generateStaticMap = require('../lib/staticMap.js');


var qClient = Promise.promisifyAll(redis.createClient());


var getPassedStations = memoFactory({
  prefix: 'passed',
  client: qClient,
  expire: 60
}, function(name) {

  return formpost(
      'http://115.29.204.94/ViewRoutePassedStations/wechat_passed_stations_by_name', {
        'data[route_name]': name,
        'data[minutes_elapsed]': 30
      })
    .then(function(reses) {

      var passedStations = JSON.parse(reses[1]);
      if (passedStations.length === 0) {
        return -1;
      }

      return parseInt(passedStations[0]
        .ViewRoutePassedStation
        .station_sequence) - 1;
    }, function() {
      return -1;
    });
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

        var mapImagePromise = generateStaticMap({
          id: routeID,
          name: info.name
        });

        return Promise.all([
            getPassedStations(info.name),
            mapImagePromise
          ])
          .then(function(args) {
            var passedIndex = args[0] || -1;
            var mapImage = args[1];
            var url;
            var nearestIndex;

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
                name: lab.name,
                lat: lab.pos.lat,
                lng: lab.pos.lng,
                cssClass: cssClass
              };
            });
            stations[0].cssClass = 'station station--start';
            stations[stations.length - 1].cssClass =
              'station station--end';

            if (passedIndex === -1) {
              url = mapImage.showMarker(marker);
              nearestIndex = mapImage._nearestLabelIndex(
                marker);
            } else {
              url = mapImage.showMarkerWithIndex(marker, passedIndex);
              nearestIndex = passedIndex;
            }

            mapImage
              .zoomTo(17)
              .centerTo(marker);


            res.render('detail', {
              routeName: info.name,
              img_url: mapImage.toURL(),
              title: info.name + '详细信息',
              info: info,
              stations: stations,
              updateAT: info.updateAT,
              address: info.address,
              poi: info.poi,
              product: process.env.PORT,
            });
          });
      }).catch(function(err) {
        console.log(err, err.stack);
        res.render('error');
      });

  });
};