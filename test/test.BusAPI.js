'use strict';
var API = require('../lib/BusAPI.js');
var expect = require('chai').expect;
var Memo = require('../lib/RedisMemo.js');

describe('quickbus API', function() {
  var routeID = 54;

  it('should return a promise', function() {
    expect(API.getStations(routeID).then).is.an('function');
  });

  it('should resolve with a array', function(done) {
    API.getStations(routeID)
      .then(function(stations) {
        expect(stations).is.an('Array');
      })
      .done(done);

  });

  it('should work with memo ', function(done) {
    var func = Memo({
      prefix: 'stations:'
    }, API.getStations);

    func(routeID)
      .then(function() {})
      .done(done);
  });


  it.skip('should work', function(done) {
    API.getRoutePointsByName('家乐福万里店5号班车')
      .then(function(ps) {
        console.log('logs', ps);

      }).done(done);
  });


});