'use strict';
/* global require, exports,process */

var urlencode = require('urlencode');
var md5 = require('MD5');
var _request = require('request');
var bluebird = require('bluebird');
var request = _request.defaults({proxy:process.env.proxy});

var requestQ = bluebird.promisify(request);

var genSN = function(ak,sk,queryString){
  var enUrl = urlencode('/geoconv/v1/?'+queryString+sk);
  return md5(enUrl);
};


exports.toBaiduCoordsQ = function(lon,lat,ak,sk){

  var queryString = 'from=1&to=5&ak='+ak+'&coords='+lon+','+lat;

  var sn=genSN(ak,sk,queryString);

  var url= 'http://api.map.baidu.com/geoconv/v1/'+'?'+queryString+'&sn='+sn;

  return requestQ(url).then(
    function(content){
      var body = content[1];
      var response =  JSON.parse(body);
      return {
        lng:response.result[0].x,
        lat:response.result[0].y
      };
    });

};

exports.getPOI = function(lng,lat,ak){
  var queryString = 'ak='+ak+'&location='+lat+','+lng +'&output=json&pois=1';

  var url= 'http://api.map.baidu.com/geocoder/v2/'+'?'+queryString ;

  return requestQ(url).then(
    function(content){
      var body = content[1];
      var response =  JSON.parse(body);
      return {
        address:response.result.formatted_address,
        pois: response.result.pois
      };
    });
};



exports.getImageUrl = function(lon,lat){

  var coordsString = '' + lon +',' +lat;

  return 'http://api.map.baidu.com/staticimage?' +
         'center='+ coordsString +
         '&width=600&height=300&zoom=18'+
         '&markers=' + coordsString;
};

