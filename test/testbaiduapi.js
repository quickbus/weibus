'use strict';

var baiduapi = require('../lib/baidu.js');
var expect = require('chai').expect;

describe('new api', function() {

  var api;
  before(function() {
    api = new baiduapi.BaiduMapAPI({
      ak: '1wpk9X6wAbE9D2pHZRYNhmLw',
      sk: 'B3a0e39639fd1f554f475822989decd0'
    });
  });

  it('shoud throw erro when no ak or sk', function() {
    expect(function() {
      new baiduapi.BaiduMapAPI();
    }).to.throw('No ak or sk');
  });

  it('ok with sk ak construct', function() {
    expect(api).to.be.ok;
  });

  it('can get baidu Cords', function(done) {
    api.toBaiduCoorArray([{
        lng: 121.423461,
        lat: 31.273049
      }, {
        lng: 121.423461,
        lat: 31.273020
      }])
      .then(function(cords) {
        expect(cords.length).to.equal(2);
        done();
      }).catch(done);
  });

  it('can get baidu a cord', function(done) {
    api.toBaiduCoordsQ({
      lng: 121.423461,
      lat: 31.273049
    }).then(function(cord) {
      done();
    }).catch(done);

  });


  it('can get point of interesting', function(done) {
    api.getPOI({
        lng: 121.59935705401,
        lat: 31.152478125873
      })
      .then(function() {
        done();
      })
      .catch(done);
  });
});
