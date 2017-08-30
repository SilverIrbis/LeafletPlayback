L.Playback = L.Playback.Clock.extend({
        statics : {
            MoveableMarker : L.Playback.MoveableMarker,
            Track : L.Playback.Track,
            TrackController : L.Playback.TrackController,
            Clock : L.Playback.Clock,
            Util : L.Playback.Util,

            TracksLayer : L.Playback.TracksLayer,
            PlayControl : L.Playback.PlayControl,
            DateControl : L.Playback.DateControl,
            SliderControl : L.Playback.SliderControl
        },

        options : {
            tickLen: 250,
            speed: 1,
            maxInterpolationTime: 5*60*1000, // 5 minutes

            tracksLayer : true,

            playControl: false,
            dateControl: false,
            sliderControl: false,

            // options
            layer: {
                // pointToLayer(featureData, latlng)
            },

            marker : {
                // getPopup(feature)
            }
        },

        initialize : function (map, geoJSONArray, callback, options) {
            L.setOptions(this, options);

            this._map = map;
            this._trackController = new L.Playback.TrackController(map, null, this.options);
            L.Playback.Clock.prototype.initialize.call(this, this._trackController, callback, this.options);

            if (this.options.tracksLayer) {
                this._tracksLayer = new L.Playback.TracksLayer(map, options);
            }

            this.setData(geoJSONArray);


            if (this.options.playControl) {
                this.playControl = new L.Playback.PlayControl(this);
                this.playControl.addTo(map);
            }

            if (this.options.sliderControl) {
                this.sliderControl = new L.Playback.SliderControl(this);
                this.sliderControl.addTo(map);
            }

            if (this.options.dateControl) {
                this.dateControl = new L.Playback.DateControl(this, options);
                this.dateControl.addTo(map);
            }

        },

        clearData : function(){
            this._trackController.clearTracks();

            if (this._tracksLayer) {
                this._tracksLayer.clearLayer();
            }
        },

        setData : function (geoJSONArray) {
            var startTime;

            this.clearData();

            this.addData(geoJSONArray, this.getTime());

            startTime = this.getStartTime();

            if (this.sliderControl) {
              this.sliderControl._slider.min = startTime;
              this.sliderControl._slider.max = this.getEndTime();
            }

            this.setCursor(startTime);
        },

        // bad implementation
        addData : function (geoJSONArray, ms) {
            // return if data not set
            if (!geoJSONArray || !geoJSONArray.length) {
                return;
            }

            for (var i = 0, len = geoJSONArray.length; i < len; i++) {
              this._trackController.addTrack(new L.Playback.Track(geoJSONArray[i], this.options), ms);
            }

            this._map.fire('playback:set:data');

            if (this.options.tracksLayer) {
                this._tracksLayer.addLayer(geoJSONArray);
            }
        },

        destroy: function() {
            this.clearData();
            if (this.playControl) {
                this._map.removeControl(this.playControl);
            }
            if (this.sliderControl) {
                this._map.removeControl(this.sliderControl);
            }
            if (this.dateControl) {
                this._map.removeControl(this.dateControl);
            }
            if (this._tracksLayer && this._tracksLayer.overlayControl) {
              this._map.removeControl(this._tracksLayer.overlayControl);
            }
        }
    });

L.Map.addInitHook(function () {
    if (this.options.playback) {
        this.playback = new L.Playback(this);
    }
});

L.playback = function (map, geoJSON, callback, options) {
    return new L.Playback(map, geoJSON, callback, options);
};
