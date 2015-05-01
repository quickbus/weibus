'use strict';

var memofactory = require('./RedisMemo.js');
var redis = require('redis');
var busAPI = require('./BusAPI.js');
var Promise = require('bluebird');
var MapImage = require('../lib/MapImage.js');

var qClient = Promise.promisifyAll(redis.createClient());
var getStations = memofactory({
    prefix: 'stations:',
    client: qClient,
    expire: 3600
  },
  busAPI.getStations);

module.exports = function generateStaticMap(req) {

  var lines = busAPI.getRoutePointsByName(req.name);
  var stations = getStations(req.id);

  return Promise
    .all([stations, lines])
    .then(function function_name(args) {
      var image = new MapImage({
        route_stations: args[0],
        points: args[1]
      });
      return image;
    });

};