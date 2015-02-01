'use strict';
var APIURL = 'http://api.map.baidu.com/staticimage?';


function Label(pos, colorconfig) {
  this.pos = pos;
  this.color = colorconfig.color || '0xffffff';
  this.backgroundColor = colorconfig.backgroundColor || '0xff0000';
  this.name = pos.name;
}

Label.prototype.toLabelString = function() {

  return [this.pos.lng, this.pos.lat].join();
};

Label.prototype.arrived = function() {
  this.backgroundColor = '0x005AAA';
};

Label.prototype.waited = function() {
  this.backgroundColor = '0xF4F4F4';
  this.color = '0x000000';
};

Label.prototype.atHere = function() {
  this.backgroundColor = '0xD22115';
  this.color = '0xFFFFFF';
};

Label.prototype.toLabelStyleString = function(name) {
  return [name || this.name, 1, 20, this.color, this.backgroundColor, 1].join();
};

function MapImage(configuration) {

  var config = configuration || {};

  if (!config.route_stations) {
    throw Error('No route station set');
  }

  this.height = config.height || 300;
  this.width = config.width || 600;
  this.labels = config.route_stations.map(function(route) {
    return new Label({
      lng: route.lng,
      lat: route.lat,
      name: route.name
    }, {});

  });

}

MapImage.prototype.showMarker = function(marker,zoomLevel) {

  var index = this._nearestLabelIndex(marker);

  this.labels.forEach(function(lab, i) {
    if (index === i) {
      lab.atHere();
    } else if (index > i) {
      lab.arrived();
    } else {
      lab.waited();
    }
  });

  var labelString = 'labels=' + this.labels.map(function(l) {
    return l.toLabelString();
  }).join('|');

  var styleString = 'labelStyles=' + this.labels.map(function(l, i) {
    return l.toLabelStyleString(i + 1);
  }).join('|');

  // var center = 'center=' + marker.lng + ',' + marker.lat;
  var markers = 'markers=' + marker.lng + ',' + marker.lat;
  var center  = 'center='+ marker.lng + ',' + marker.lat;
  var markerStyles = 'markerStyles=-1,http://121.41.74.107/images/bus32.png';
  zoomLevel = zoomLevel || 15;
  var zoom = 'zoom='+zoomLevel;
  var size = 'height=400&width=800';
  return APIURL + [size, labelString, styleString,
    markers, markerStyles, center,zoom
  ].join('&');
};

function toRadians(x) {
  return x / 180.0 * 3.1415926;
}

function distanceScale(lat1, lng1, lat2, lng2) {
  var dx = lng1 - lng2;
  var dy = lat1 - lat2;
  var b = (lat1 + lat2) / 2.0;
  var Lx = toRadians(dx) * Math.cos(toRadians(b)); // 东西距离
  var Ly = toRadians(dy);
  return Lx * Lx + Ly * Ly;
}

MapImage.prototype._nearestLabelIndex = function(pos) {

  var index = 0;
  var scale = Infinity;

  this.labels.forEach(function(lab, i) {

    var s = distanceScale(lab.pos.lat, lab.pos.lng,
      pos.lat, pos.lng);
    if (s < scale) {
      scale = s;
      index = i;
    }
  });

  return index;
};


module.exports = MapImage;
