'use strict';
var APIURL = 'http://api.map.baidu.com/staticimage?';


function Label(pos, colorconfig) {
	this.pos = pos;
	this.color = colorconfig.color || '0xffffff';
	this.backgroundColor = colorconfig.backgroundColor || '0xff0000';
}

Label.prototype.toLabelString = function() {

	return [this.pos.lng, this.pos.lat].join();
};

Label.prototype.toLabelStyleString = function(name) {
	return [name, 1, 14, this.color, this.backgroundColor].join();
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
			lat: route.lat
		}, {});

	});

}


MapImage.prototype.showMarker = function(marker) {
	var labelString = 'label=' + this.labels.map(function(l) {
		return l.toLabelString();
	}).join('|');

	var styleString = 'labelStyles=' + this.labels.map(function(l, i) {
		return l.toLabelStyleString(i);
	}).join('|');

	var center = 'center=' + marker.lng + ',' + marker.lat;


	return APIURL + [labelString, styleString, center].join('&');

};


module.exports = MapImage;