'use strict';

var baiduapi = require('../lib/baidu.js');
var expect = require('chai').expect;

describe('Baidu POI API', function() {

  it('should get pois ', function(done) {
    baiduapi.getPOI(121.59935705401, 31.152478125873,
        '1wpk9X6wAbE9D2pHZRYNhmLw')
      .then(function() {
        done();
      }).catch(done);
  });

});

describe('baidu Coords api', function() {
  it('can convert coord', function(done) {
    baiduapi.toBaiduCoordsQ(121.423461, 31.273049,
        'C125dcbb78c4d1e02f0404e02dd02548',
        'B3a0e39639fd1f554f475822989decd0')
      .then(function(res) {
        expect(res).to.has.keys(['lat', 'lng']);
        done();
      }).catch(done);
  });

  it('can convert coords', function(done) {
    baiduapi.toBaiduCoorArray([{
          lng: 121.423461,
          lat: 31.273049
        }, {
          lng: 121.423461,
          lat: 31.273020
        }], 'C125dcbb78c4d1e02f0404e02dd02548',
        'B3a0e39639fd1f554f475822989decd0')
      .then(function(res) {
        expect(res).to.be.an('Array');
        expect(res.length).to.equal(2);
        done();
      })
      .catch(done);
  });



});