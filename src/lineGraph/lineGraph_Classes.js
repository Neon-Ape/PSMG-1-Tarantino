function NodeFactory(width, offset, separator) {
    this._width = width;
    this._offset = offset;
    this._separator = separator;
    this._step = new Stepper();
    this._time = new Stepper();
    this._xPos = new Stepper();
    this._xPos.set(offset);
    this._xPos.setStep(width/separator);

    this.movie = function(movie, runtime){
        this._step.reset();
        this._time.reset();
        this._xPos.reset();
        this._collector._reset();
        this._collector._setMovie(movie);
        this._time.setStep(runtime/this._separator);
    };
    this.word = function (time, word) {
        this._collector._addWord(time, word);
    };
    this.timeSlot = function () {
        return this._time.get();
    };
    this.collectorCount = function () {
      return this._collector._count;
    };
    this._children = [];
    this.getNodes = function () {
        return this._children;
    };
    this._collector = {
        _movie: "",
        _count: 0,
        _words: {},
        _addWord : function (time, word) {
            this._words[time] = word;
            this._count++;
        },
        _setMovie : function (movie) {
            this._movie = movie;
        },
        _reset: function () {
            this._count = 0;
            this._words = {};
        }
    };
    this.push = function () {
        timeline = new Timeline(
            this._collector._words,
            this._time.get() - this._time.getStep(),
            this._time.get(), this._width,
            this._offset,
            this._collector._movie
        );
        this._children.push(new Node(
            this._collector._movie,
            this._collector._count,
            this._xPos.get(),
            timeline,
            this._step.get()
        ));
        this._step.step();
        this._time.step();
        this._xPos.step();
        this._collector._reset();
    }


}


function Stepper() {
    this._value = 0;
    this._step = 1;
    this.set = function (value) {
        this._value = value;
    };
    this.get =function () {
        return this._value;
    };
    this.setStep = function (step) {
        this._step = step;
    };
    this.getStep = function () {
        return this._step;
    };
    this.step = function () {
        this._value += this._step;
    };
    this.reset = function () {
        this._value = 0;
    }
}

function Node(movie, count, x, timeline, step) {
    this.movie = movie;
    this.count = count;
    this.x = Math.round(x);
    this.y = count;
    this.step = step;
    this.timeline = timeline;
}

function Timeline(data, start, end, rawWidth, offset, movie) {
    this.times = [];
    this.movie = movie;
    this.start = Math.round(start * 10) / 10;
    this.end = Math.round(end * 10) / 10;

    function Time(time, xPos, word) {
        this.time = Number(time);
        this.x = xPos;
        this.word = word;
    }

    var duration = end - start;
    var visWidth = rawWidth - offset * 2;

    for (var time in data) {
        if (data.hasOwnProperty(time)) {
            var relativeTime = time - start;
            var scalingFactor = relativeTime / duration;
            var xPos = Math.round(scalingFactor * visWidth + offset);

            this.times.push(new Time(time, xPos, data[time]));
        }
    }
}