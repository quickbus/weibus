(function() {
  'use strict';
  /* global BMap,$ */
  var map = new BMap.Map('map_container');
  map.enableDragging();
  var center = new BMap.Point(window.busLng, window.busLat);

  map.centerAndZoom(center, 15);
  var bus = new BMap.Marker(center, {
    icon: new BMap.Icon('/images/bus32.png', new BMap.Size(32, 32))
  });
  var spinner = new BMap.Marker(center, {
    icon: new BMap.Icon('../images/spin.gif', new BMap.Size(64, 64))
  });

  var stationMarker = window.stations.map(function(station) {
    var point = new BMap.Point(station.lng, station.lat);
    return new BMap.Marker(point);
  });

  map.addOverlay(spinner);

  $.getJSON('/points?name=' + window.routeName).then(function(dat) {
    var points = dat.map(function(p) {
      return new BMap.Point(p.lng, p.lat);
    });
    var line = new BMap.Polyline(points, {
      strokeWeight: 3
    });
    map.clearOverlays();
    map.addOverlay(bus);
    stationMarker.forEach(function(marker) {
      map.addOverlay(marker);
    });
    map.addOverlay(line);
  });

})();