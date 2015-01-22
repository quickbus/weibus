'use strict';
var redis = require('redis');
var Promise = require('bluebird');

module.exports = function(config, work) {

  var prefix = config.prefix || '';
  var expire = config.expire || 3600;


  var qClient = config.client || Promise.promisifyAll(redis.createClient());

  var tryRedis = function(id) {

    return qClient.getAsync(prefix + id)
      .then(function(cache) {
        if (!cache) {
          throw Error('No Cache');
        }
        return JSON.parse(cache);
      })
      .catch(function() {
        return work(id)
          .then(function(data) {

            qClient.setexAsync(prefix + id,expire, JSON.stringify(data));
            return data;
          });
      });

  };

  return tryRedis;

};