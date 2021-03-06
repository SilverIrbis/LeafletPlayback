// Simply shows all of the track points as circles.
// TODO: Associate circle color with the marker color.

L.Playback = L.Playback || {};

L.Playback.TracksLayer = L.Class.extend({
    initialize : function (map, options) {
        var layer_options = options.layer || {};
        
        if (jQuery.isFunction(layer_options)){
            layer_options = layer_options(feature);
        }
        
        if (!layer_options.pointToLayer) {
            layer_options.pointToLayer = function (featureData, latlng) {
                return new L.CircleMarker(latlng, { radius : 5 });
            };
        }

        layer_options.style = function(feature) {
            if (feature.properties.color) {
                return {color: feature.properties.color}
            }

            return {}
        }
    
        this.layer = new L.GeoJSON(null, layer_options);

        this.layer.addTo(map);

        var overlayControl = {
            'GPS Треки' : this.layer
        };

        this.overlayControl = L.control.layers(null, overlayControl, {
            collapsed : false,
            position: 'bottomleft'
        }).addTo(map);
    },

    // clear all geoJSON layers
    clearLayer : function(){
        for (var i in this.layer._layers) {
            this.layer.removeLayer(this.layer._layers[i]);            
        }
    },

    // add new geoJSON layer
    addLayer : function(geoJSON) {
        this.layer.addData(geoJSON);
    }
});