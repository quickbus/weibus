'use strict';

var baiduapi =require('../lib/baidu.js');

describe('Baidu POI API',function(){

  it('should get pois ', function(done){
    baiduapi.getPOI(121.59935705401,31.152478125873,
      '1wpk9X6wAbE9D2pHZRYNhmLw')
    .then(function(){
      done();
    }).catch(done);
  });

});