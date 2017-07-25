/*
 * This data manipulation function takes the raw data from
 * the CSV file and converts it into an array of node objects.
 * Each node will store data and visualization values to visualize
 * a bubble.
 *
 * rawData is expected to be an array of data objects, read in from
 * one of d3's loading functions like d3.csv.
 *
 * This function returns the new node array, with a node in that
 * array for each element in the rawData input.
 */

function createNodes(data, separator) {
    function Node(movie, count, x, timeline, step) {
        this.movie = movie;
        this.count = count;
        this.x = x;
        this.y = count;
        this.step = step;
        this.timeline = timeline;
    }

    var width = VAR_LG_GRAPH_WIDTH;
    var offset = VAR_LG_GRAPH_OFFSET_X;
    var pixelPerSeparator = width/separator;


    var myNodes = [];

    for (var movie in data){
        if(data.hasOwnProperty(movie)) {
            var runtime = data[movie].runtime;
            var minsPerSeparator = runtime / separator;
            //console.log(movie + " --- width: " + width + ", runtime: " + runtime + ", pixelPerSeparator: " + pixelPerSeparator + ", minsPerSeparator: " + minsPerSeparator);
            var currentTimeSlot = minsPerSeparator;
            var currentXPos = offset;
            var timeline = null;
            var step = 0;

            var collectorNode = {
                count: 0,
                words: {}
            };



            for (var time in data[movie].children) {
                if(data[movie].children.hasOwnProperty(time)) {
                    while (time > currentTimeSlot) {
                        timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, width, offset);
                        myNodes.push(new Node(movie, collectorNode.count, currentXPos, timeline, step));
                        collectorNode.words = {};
                        collectorNode.count = 0;
                        currentTimeSlot += minsPerSeparator;
                        currentXPos += pixelPerSeparator;
                        step++;
                    }

                    collectorNode.words[time] = data[movie].children[time];
                    collectorNode.count++;
                }
            }
            // add last Node
            if (collectorNode.count !== 0) {
                timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, width, offset);
                myNodes.push(new Node(movie, collectorNode.count, currentXPos, timeline, step));
                collectorNode.words = {};
                collectorNode.count = 0;
                currentTimeSlot += minsPerSeparator;
                currentXPos += pixelPerSeparator;
                step++;
            }

            while (currentTimeSlot <= runtime) {
                timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, width, offset, step);
                myNodes.push(new Node(movie, collectorNode.count, currentXPos, timeline, step));
                collectorNode.words = {};
                collectorNode.count = 0;
                currentTimeSlot += minsPerSeparator;
                currentXPos += pixelPerSeparator;
                step++;
            }

            myNodes.push(new Node(movie, 0, currentXPos, timeline, step));
        }

    }

    console.log(myNodes);
    return myNodes;
}

function createLinks(nodes) {
    function Link(source, target, movie) {
        this.movie = movie;
        this.source = source;
        this.target = target;
    }
    var myLinks = [];
    for (var i = 0; i < nodes.length - 1; i++) {
        if (nodes[i].movie === nodes[i+1].movie) {
            myLinks.push(new Link(nodes[i], nodes[i + 1], nodes[i].movie));
        }
    }

    console.log(myLinks);
    return myLinks;

}

function createBars(nodes) {
    function Bar(x,y,width,height,step) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.step = step;
    }

    var myBars = [];
    for (var i = 0; i < nodes.length - 1; i++) {
        if (nodes[i+1].movie === 'Reservoir Dogs') {
            myBars.push(new Bar(nodes[i].x,VAR_LG_BARS_Y,nodes[i+1].x-nodes[i].x, VAR_LG_BARS_HEIGHT, nodes[i].step));
        }
    }

    console.log(myBars);
    return myBars;
}

function createTimeline(data, start, end, rawWidth, offset) {
    //console.log('start: ' + start + ', end: ' + end + ', rawWidth: ' + rawWidth + ", offset:" + offset);
    var timeline = {};
    var duration = end - start;
    var visWidth = rawWidth - offset*2;

    for(var time in data) {
        if (data.hasOwnProperty(time)) {
            timeline[time] = {};
            var relativeTime = time - start;
            var scalingFactor = relativeTime / duration;
            var xPos = scalingFactor * visWidth + offset;

            timeline[time]["word"] = data[time];
            timeline[time]["xPos"] = xPos;
            timeline[time]["start"] = start;
            timeline[time]["end"] = end;
        }
    }
    console.log(timeline);
    return timeline;
}

function createTimes(nodes) {
    function Time(time, xPos, word, movie, step, start, end) {
        this.movie = movie;
        this.time = time;
        this.x = xPos;
        this.word = word;
        this.step = step;
        this.start = start;
        this.end = end;
    }

    var times = [];

    for (var i = 0; i < nodes.length - 1; i++) {
        var currentTimeline = nodes[i].timeline;
        for (time in currentTimeline) {
            if (currentTimeline.hasOwnProperty(time)) {
                times.push(new Time(time, currentTimeline[time]["xPos"], currentTimeline[time]["word"], nodes[i].movie, nodes[i].step), currentTimeline[time]["start"], currentTimeline[time]["end"]);
            }
        }
    }

    console.log(times);
    return times;
}
