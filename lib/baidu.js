/* global require, console, exports */
'use strict';

var urlencode = require('urlencode');
var md5 = require('MD5');
var request = require('request');
var bluebird = require('bluebird');


var requestQ = bluebird.promisify(request);


var genSN = function(ak,sk,queryString){
  var enUrl = urlencode('/geoconv/v1/?'+queryString+sk);
  return md5(enUrl);
};




// console.log( genSN('C125dcbb78c4d1e02f0404e02dd02548',
//   'B3a0e39639fd1f554f475822989decd0',
//   'coords=120.160461,30.166800&from=3&to=5&ak=C125dcbb78c4d1e02f0404e02dd02548',
//   'GET'));


exports.toBaiduCoordsQ = function(lon,lat,ak,sk){

  var queryString = 'from=1&to=5&ak='+ak+'&coords='+lon+','+lat;

  var sn=genSN(ak,sk,queryString);

  var url= 'http://api.map.baidu.com/geoconv/v1/'+'?'+queryString+'&sn='+sn;

  console.log(url);

  return requestQ(url).then(
    function(content){
      var body = content[1];
      var response =  JSON.parse(body);
      console.log(body);
      return {
        lng:response.result[0].x,
        lat:response.result[0].y
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


/*

coords convert

http://api.map.baidu.com/geoconv/v1/?coords=120.160461,30.166800&from=3&to=5&ak=C125dcbb78c4d1e02f0404e02dd02548&sn=a03676cc8dcf07c1f29b892af93af237


coords to image

http://api.map.baidu.com/staticimage?center=120.16702049327,30.172615381261&width=600&height=300&zoom=18&markers=120.16702049327,30.172615381261

coords to address  pay attention to the location
http://api.map.baidu.com/geocoder?location=30.172615381261,120.16702049327&coord_type=gcj02&output=html&coord_type=bd09ll



*/
