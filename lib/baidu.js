'use strict';
/* global require, exports,process */

var urlencode = require('urlencode');
var md5 = require('MD5');
var _request = require('request');
var bluebird = require('bluebird');
var request = _request.defaults({
  proxy: process.env.proxy
});

var requestQ = bluebird.promisify(request);

var genSN = function(ak, sk, queryString) {
  var enUrl = urlencode('/geoconv/v1/?' + queryString + sk);
  return md5(enUrl);
};


var toLngLatString = function(coords, delimiter) {
  return coords.map(function(o) {
    return o.lng + ',' + o.lat;
  }).join(delimiter || ';');
};


var toBaiduCoorArray = function(llArray, ak, sk) {
  var queryString = 'from=1&to=5&ak=' + ak + '&coords=' + toLngLatString(llArray);
  var sn = genSN(ak, sk, queryString);

  var url = 'http://api.map.baidu.com/geoconv/v1/' + '?' + queryString + '&sn=' + sn;

  return requestQ(url).then(
    function(content) {
      var body = content[1];
      var response = JSON.parse(body);
      return response.result.map(function(o) {
        return {
          lng: o.x,
          lat: o.y
        };
      });
    });
};


var toBaiduCoordsQ = function(lon, lat, ak, sk) {

  var queryString = 'from=1&to=5&ak=' + ak + '&coords=' + lon + ',' + lat;

  var sn = genSN(ak, sk, queryString);

  var url = 'http://api.map.baidu.com/geoconv/v1/' + '?' + queryString + '&sn=' + sn;

  return requestQ(url).then(
    function(content) {
      var body = content[1];
      var response = JSON.parse(body);
      return {
        lng: response.result[0].x,
        lat: response.result[0].y
      };
    });

};

var getPOI = function(lng, lat, ak) {
  var queryString = 'ak=' + ak + '&location=' + lat + ',' + lng + '&output=json&pois=1';

  var url = 'http://api.map.baidu.com/geocoder/v2/' + '?' + queryString;

  return requestQ(url).then(
    function(content) {
      var body = content[1];
      var response = JSON.parse(body);
      return {
        lng: lng,
        lat: lat,
        address: response.result.formatted_address,
        pois: response.result.pois
      };
    });
};


function BaiduMap(config) {
  if (!config || !config.ak || !config.sk) {
    throw new Error('No ak or sk assinge');
  }

  this.ak = config.ak;
  this.sk = config.sk;
}

BaiduMap.prototype.toBaiduCoorArray = function(llArray) {
  return toBaiduCoorArray(llArray, this.ak, this.sk);
};

BaiduMap.prototype.getPOI = function(location) {
  return getPOI(location.lng,
    location.lat, this.ak);
};

BaiduMap.prototype.toBaiduCoordsQ = function(location) {
  return toBaiduCoordsQ(
    location.lng, location.lat, this.ak, this.sk
  );
};

exports.getImageUrl = function(lon, lat) {

  var coordsString = '' + lon + ',' + lat;

  return 'http://api.map.baidu.com/staticimage?' +
    'center=' + coordsString +
    '&width=600&height=300&zoom=18' +
    '&markers=' + coordsString;
};

exports.BaiduMapAPI = BaiduMap;

exports.getImageUrlx = function(coords) {

  var coordsString = toLngLatString(coords, '|');
  var stardCoord = toLngLatString([coords[0]]);
  var lables = coords.map(function(o, i) {
    var num = i + 1;
    return ' ' + num + ' ,1,14,0xffffff,0xff0000,1';
  }).join('|');

  return 'http://api.map.baidu.com/staticimage?' +
    'center=' + stardCoord +
    '&width=600&height=300&zoom=18' +
    '&labels=' + coordsString +
    '&labelStyles=' + lables;
};