'use strict';
/*global require,module */

var Promise = require('bluebird');
var _request = require('request');

var request = _request.defaults({'proxy':process.env.proxy});


function defer() {
    var resolve, reject;
    var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

var formpost = function(url, body){

  var deffered = defer();

  var req = request.post(url,function(err,res,body){

    if(err){
      deffered.reject(err);
    }

    deffered.resolve([res,body]);

  });

  var form = req.form();
  for(var key in body){
    if( body.hasOwnProperty(key)){
      form.append(key,body[key]);
    }
  }

  return deffered.promise;

};

module.exports = formpost;

// // formpost(
//   'http://42.121.133.161/ViewUserLatestPosPhones/wechat_route_latest_position'
//   'http://42.121.133.161/ViewUserLatestPosPhones/wechat_passenger_inquiry',
//   {'data[phone_num]':'13524677703'})
//   .then(console.log);