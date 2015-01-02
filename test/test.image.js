'use strict';
var api = require('../lib/baidu.js');

var exec = require('child_process').exec;
var route1 = require('./route1.json');



describe.only('make image for real route', function() {

  it('translate all coords to baidu coords', function(done) {


    var coords = route1.map(function(route) {
      return {
        lng: route.ViewUserRouteDetail.station_lng,
        lat: route.ViewUserRouteDetail.station_lat
      };

    });

    api.toBaiduCoorArray(coords, 'C125dcbb78c4d1e02f0404e02dd02548',
        'B3a0e39639fd1f554f475822989decd0')
      .then(function(res) {
        console.log(res);

        var coordsInfo = res.map(function(o, i) {
          o.name = route1[i].ViewUserRouteDetail.station_name;
          return o;
        });

        console.log(api.getImageUrlx(coordsInfo));
        exec('"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" "' + api.getImageUrlx(res) + '"', done);

      })
      .catch(done);



  });
});