L.Playback = L.Playback || {};

L.Playback.Util = L.Class.extend({
  statics: {

    DateStr: function(time) {
      var date = new Date(time);
      var d = date.getDate();
      var m = date.getMonth() + 1;
      var y = date.getFullYear();

      d = d < 10 ? '0' + d : d;
      m = m < 10 ? '0' + m : m;
      return d + '.' + m + '.' + y;
    },

    TimeStr: function(time) {
      var d = new Date(time);
      var h = d.getHours();
      var m = d.getMinutes();
      var s = d.getSeconds();
      if (h < 10) h = '0' + h;
      if (m < 10) m = '0' + m;
      if (s < 10) s = '0' + s;
      return h + ':' + m + ':' + s;
    },

    ParseGPX: function(gpx) {

	  var geojsonRoot = {
        type: 'FeatureCollection',
		features : []
      };



      var xml = $.parseXML(gpx);

      var trks = $(xml).find('trk');
      for (var trackIdx=0, numberOfTracks=trks.length; trackIdx<numberOfTracks; trackIdx++) {

        var track = trks[trackIdx];
        var geojson = {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates: []
          },
          properties: {
            trk : {},
            time: [],
            speed: [],
            altitude: [],
            bbox: []
          }
        };

        geojson.properties.trk.name = $(track).find('name').text();
        geojson.properties.trk.desc = $(track).find('desc').text();
        geojson.properties.trk.type = $(track).find('type').text();
        geojson.properties.trk.src = $(track).find('src').text();

        var pts = $(track).find('trkpt');
        for (var i=0, len=pts.length; i<len; i++) {
          var p = pts[i];
          var lat = parseFloat(p.getAttribute('lat'));
          var lng = parseFloat(p.getAttribute('lon'));
          var timeStr = $(p).find('time').text();
          var eleStr = $(p).find('ele').text();
          var t = new Date(timeStr).getTime();
          var ele = parseFloat(eleStr);

          var coords = geojson.geometry.coordinates;
          var props = geojson.properties;

          var time = props.time;
          var altitude = geojson.properties.altitude;

          coords.push([lng,lat]);
          time.push(t);
          altitude.push(ele);
        }
        geojsonRoot.features.push(geojson);
      }

      return geojsonRoot;

    }
  }

});
