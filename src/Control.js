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
        this._button.innerHTML = 'Старт';
        this._button.className = 'btn btn-success';

        this._speedValues = [1, 3, 5];
        this._speedButtons = [];

        this._speedValues.forEach(function(speed) {
          var button = L.DomUtil.create('button', '', playControl);

          button.innerHTML = speed + 'x';
          button.className = 'btn btn-default';
          button.dataset.speed = speed;

          L.DomEvent.on(button, 'click', changeSpeed, self);

          self._speedButtons.push(button);
        });

        this._speedButtons[0].className = 'btn btn-brand';

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
          .on(this._container, 'click mousedown dblclick touchmove touchend', stop)
          .on(this._container, 'click', L.DomEvent.preventDefault)
          .on(this._button, 'click', play);

        function changeSpeed(e) {
            var self = playback.playControl;
            var button = e.target;

            self._speedButtons.forEach(function(button) {
              button.className = 'btn btn-default';
            })

            button.className = 'btn btn-brand';
            self._speed = +button.dataset.speed;

            if (playback.isPlaying()) {
                playback.stop();
                playback.start();

                self._button.innerHTML = 'Пауза';
                self._button.className = 'btn btn-default';
            } else {
              self._button.innerHTML = 'Старт';
              self._button.className = 'btn btn-success';
            }
        }
        
        function play(){
            if (playback.isPlaying()) {
                playback.stop();
                self._button.innerHTML = 'Старт';
                self._button.className = 'btn btn-success';
            }
            else {
                playback.start();
                self._button.innerHTML = 'Пауза';
                self._button.className = 'btn btn-default';
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