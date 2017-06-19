L.Playback = L.Playback || {};

L.Playback.DateControl = L.Control.extend({
    options : {
        position : 'bottomleft',
        dateFormatFn: L.Playback.Util.DateStr,
        timeFormatFn: L.Playback.Util.TimeStr
    },

    initialize : function (playback, options) {
        L.setOptions(this, options);
        this.playback = playback;
    },

    onAdd : function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');

        var self = this;
        var playback = this.playback;
        var time = playback.getTime();

        var datetime = L.DomUtil.create('div', 'datetimeControl', this._container);

        // date time
        this._date = L.DomUtil.create('span', '', datetime);
        this._time = L.DomUtil.create('span', '', datetime);

        this._date.innerHTML = this.options.dateFormatFn(time) + ' ';
        this._time.innerHTML = this.options.timeFormatFn(time);

        // setup callback
        playback.addCallback(function (ms) {
            self._date.innerHTML = self.options.dateFormatFn(ms) + ' ';
            self._time.innerHTML = self.options.timeFormatFn(ms);
        });

        return this._container;
    }
});

L.Playback.PlayControl = L.Control.extend({
    options : {
        position : 'bottomleft'
    },

    initialize : function (playback) {
        this.playback = playback;
    },

    onAdd : function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');

        var self = this;
        var playback = this.playback;
        playback.setSpeed(100);

        var playControl = L.DomUtil.create('div', 'playControl', this._container);

        this._button = L.DomUtil.create('button', '', playControl);

        this._speed = 1;
        this._button.innerHTML = 'Старт (' + this._speed + 'x)';

        this._speedSlider = L.DomUtil.create('input', 'slider', playControl);
        this._speedSlider.type = 'range';
        this._speedSlider.className = 'leaflet-speed-slider';
        this._speedSlider.min = 1;
        this._speedSlider.max = 3;
        this._speedSlider.value = 1;

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
        .on(this._container, 'click mousedown dblclick touchmove touchend', stop)
        .on(this._container, 'click', L.DomEvent.preventDefault)
        .on(this._button, 'click', play)
        .on(this._speedSlider, 'change mousemove', changeSpeed, this);

        function changeSpeed(e) {
            var self = playback.playControl;
            var val = Number(e.target.value);

            self._speed = val

            if (playback.isPlaying()) {
                playback.stop();
                playback.start();

                self._button.innerHTML = 'Пауза (' + self._speed + 'x)';
            } else {
              self._button.innerHTML = 'Старт (' + self._speed + 'x)';
            }
        }
        
        function play(){
            if (playback.isPlaying()) {
                playback.stop();
                self._button.innerHTML = 'Старт (' + self._speed + 'x)';
            }
            else {
                playback.start();
                self._button.innerHTML = 'Пауза (' + self._speed + 'x)';
            }
        }

        return this._container;
    }
});

L.Playback.SliderControl = L.Control.extend({
    options : {
        position : 'bottomleft'
    },

    initialize : function (playback) {
        this.playback = playback;
    },

    onAdd : function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');

        var self = this;
        var playback = this.playback;

        // slider
        this._slider = L.DomUtil.create('input', 'slider', this._container);
        this._slider.type = 'range';
        this._slider.min = playback.getStartTime();
        this._slider.max = playback.getEndTime();
        this._slider.value = playback.getTime();

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
        .on(this._container, 'mousedown dblclick click mousemove mouseup touchmove touchend', stop)
        .on(this._slider, 'change mousemove', onSliderChange, this);


        function onSliderChange(e) {
            var val = Number(e.target.value);
            playback.setCursor(val);
        }

        playback.addCallback(function (ms) {
            self._slider.value = ms;
        });
        
        
        map.on('playback:add_tracks', function() {
            self._slider.min = playback.getStartTime();
            self._slider.max = playback.getEndTime();
            self._slider.value = playback.getTime();
        });

        return this._container;
    }
});      