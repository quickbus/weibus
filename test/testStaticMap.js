'use strict';

var generateStaticMap = require('../lib/staticMap.js');

describe('static Map', function() {
  it('should', function(done) {

    generateStaticMap({
        name: '家乐福万里店5号班车',
        id: 59
      })
      .then(function(mapImage) {
        mapImage.showMarkerWithIndex({
          lng: 121.43512611909,
          lat: 31.260546444238
        }, 4);
      }).done(done);
  });
});