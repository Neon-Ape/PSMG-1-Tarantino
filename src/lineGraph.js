function lineGraph(){
    // Constants for sizing

    var width = 1200;
    var height = 400;
    var yOffset = 100;
    var xOffset = width/20;
    var xCutOff = width*9/10;
    var timelineHeight = 100;
    var animationDuration = 800;

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 240);

    var start = {x: width/2, y: height + 20};

    var activeGraphs = {
        "Reservoir Dogs" : true,
        "Pulp Fiction" : false,
        "Jackie Brown" : false,
        "Kill Bill: Vol. 1" : false,
        "Kill Bill: Vol. 2" : false,
        "Inglorious Basterds" : false,
        "Django Unchained" : false
    };

    var classes = {
        "Reservoir Dogs" : 'dogs',
        "Pulp Fiction" : 'pulp',
        "Jackie Brown" : 'jackie',
        "Kill Bill: Vol. 1" : 'bill1',
        "Kill Bill: Vol. 2" : 'bill2',
        "Inglorious Basterds" : 'basterds',
        "Django Unchained" : 'django'
    };

    function getClass(d) {
        return classes[d];
    }

    var activeStep = 0;


    var scaleData = [
        {
            x1: 0,
            y1: height-yOffset,
            x2:xCutOff,
            y2:height-yOffset,
            text: '0'
        },
        {
            x1: 0,
            y1: height-yOffset-40,
            x2:xCutOff,
            y2:height-yOffset-40,
            text: '10'
        },
        {
            x1: 0,
            y1: height-yOffset-80,
            x2:xCutOff,
            y2:height-yOffset-80,
            text: '20'
        },
        {
            x1: 0,
            y1: height-yOffset-120,
            x2:xCutOff,
            y2:height-yOffset-120,
            text: '30'
        },
        {
            x1: 0,
            y1: height-yOffset-160,
            x2:xCutOff,
            y2:height-yOffset-160,
            text: '40'
        },
        {
            x1: 0,
            y1: height-yOffset-200,
            x2:xCutOff,
            y2:height-yOffset-200,
            text: '50'
        },
        {
            x1: 0,
            y1: height-yOffset-240,
            x2:xCutOff,
            y2:height-yOffset-240,
            text: '60'
        },
        {
            x1: 0,
            y1: height-yOffset-280,
            x2:xCutOff,
            y2:height-yOffset-280,
            text: '70'
        }
    ];

    // These will be set in create_nodes and create_vis
    var svg = null;
    var points = null;
    var links = null;
    var nodeData = [];

    // Nice looking colors - no reason to buck the trend
    // @v4 scales now have a flattened naming scheme
    var fillColor = d3.scaleOrdinal()
        .domain(['Reservoir Dogs', 'Pulp Fiction', 'Jackie Brown', 'Kill Bill: Vol. 1', 'Kill Bill: Vol. 2', 'Death Proof', 'Inglorious Basterds', 'Django Unchained', 'Hateful Eight'])
        .range(['#d85e90', '#3c4e94', '#070707', '#fff11b','#ea1f18','#BDC8E7','#4a674a','#730000', '#AAAAAA']);

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

    function createNodes(data, separator, rawWidth, rawHeight) {
        function Node(movie, count, x, timeline, step) {
            this.movie = movie;
            this.count = count;
            this.x = x;
            this.y = rawHeight - count * 4;
            this.step = step;
            this.timeline = timeline;
        }

        var width = rawWidth*8/10;
        var offset = rawWidth/20;
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
                            timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, rawWidth, offset);
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
                    timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, rawWidth, offset);
                    myNodes.push(new Node(movie, collectorNode.count, currentXPos, timeline, step));
                    collectorNode.words = {};
                    collectorNode.count = 0;
                    currentTimeSlot += minsPerSeparator;
                    currentXPos += pixelPerSeparator;
                    step++;
                }

                while (currentTimeSlot <= runtime) {
                    timeline = createTimeline(collectorNode.words, currentTimeSlot - minsPerSeparator, currentTimeSlot, rawWidth, offset, step);
                    myNodes.push(new Node(movie, collectorNode.count, currentXPos, timeline));
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
                myBars.push(new Bar(nodes[i].x,10,nodes[i+1].x-nodes[i].x, height-yOffset-10, nodes[i].step));
            }
        }

        console.log(myBars);
        return myBars;
    }

    function createTimeline(data, start, end, rawWidth, offset) {
        console.log('start: ' + start + ', end: ' + end + ', rawWidth: ' + rawWidth + ", offset:" + offset);
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
            }
        }
        console.log(timeline);
        return timeline;
    }

    function createTimes(nodes) {
        function Time(time, xPos, word, movie, step) {
            this.movie = movie;
            this.time = time;
            this.x = xPos;
            this.word = word;
            this.step = step;
        }

        var times = [];

        for (var i = 0; i < nodes.length - 1; i++) {
            var currentTimeline = nodes[i].timeline;
            for (time in currentTimeline) {
                if (currentTimeline.hasOwnProperty(time)) {
                    times.push(new Time(time, currentTimeline[time]["xPos"], currentTimeline[time]["word"], nodes[i].movie, nodes[i].step));
                }
            }
        }

        console.log(times);
        return times;
    }


    /*
     * Main entry point to the bubble chart. This function is returned
     * by the parent closure. It prepares the rawData for visualization
     * and adds an svg element to the provided selector and starts the
     * visualization creation process.
     *
     * selector is expected to be a DOM element or CSS selector that
     * points to the parent element of the bubble chart. Inside this
     * element, the code will add the SVG container for the visualization.
     *
     * rawData is expected to be an array of data objects as provided by
     * a d3 loading function like d3.csv.
     */
    var chart = function chart(selector, selector2, rawData, separator) {

        if(typeof(separator)==='undefined') {
            separator = 10;
        }

        // convert raw data into nodes data
        nodeData = createNodes(rawData, separator, width, height - yOffset);
        linkData = createLinks(nodeData);
        timeData = createTimes(nodeData);
        barData = createBars(nodeData);
        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Bind nodes data to what will become DOM elements to represent them.
        links = svg.selectAll('.link')
            .data(linkData, function (d) { return d.id; });

        points = svg.selectAll('.bubble')
            .data(nodeData, function (d) { return d.id; });

        var scale = svg.selectAll('.scale')
            .data(scaleData, function (d) { return d.id; });

        var scaleE = scale.enter().append('line')
            .classed('scale', true)
            .attr('x1', function (d) { return d.x1;})
            .attr('y1', function (d) { return d.y1;})
            .attr('x2', function (d) { return d.x2;})
            .attr('y2', function (d) { return d.y2;});

        scale = scale.merge(scaleE);

        var scaleText = svg.selectAll('.scaleText')
            .data(scaleData, function (d) { return d.id; });

        scaleTextE = scaleText.enter().append("text")
            .classed('scaleText', true)
            .attr("y", function (d) { return d.y1+5;})
            .attr("x", function(d){ return d.x2+10;})
            .attr('text-anchor', 'middle')
            .text(function (d) { return d.text;});

        scaleText = scaleText.merge(scaleTextE);




        // build the timeline
        svg2 = d3.select(selector2)
            .append('svg')
            .attr('width', width)
            .attr('height', timelineHeight);

        times = svg2.selectAll('.circle')
            .data(timeData, function (d) { return d.id; });

        var timesE = times.enter().append('line')
            .classed('timeStamp', true)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 40)
            .attr('stroke', function (d) { return d3.rgb(fillColor(d.movie));})
            .attr('stroke-width', 2)
            .attr('opacity',0);

        times = times.merge(timesE);

        // uncomment commented linkData for dotted links
        var linksE = links.enter().append('line')
            .classed('link', true)
            .each(function(d) {
                d3.select(this).classed(getClass(d.movie),true);})
            .attr('x1', function (d) { return Number(d.source.x);})
            .attr('y1', start.y)
            .attr('x2', function (d) { return Number(d.target.x);})
            .attr('y2', start.y);

        links = links.merge(linksE);


        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        var pointsE = points.enter().append('circle')
            .classed('bubble', true)
            .each(function(d) {
                d3.select(this).classed(getClass(d.movie),true);})
            .classed(function (d) { return classes[d.movie];}, true)
            .attr('r', 2)
            .attr('cy', start.y)
            .attr('cx', function (d) { return Number(d.x)});

        // @v4 Merge the original empty selection and the enter selection
        points = points.merge(pointsE);

        var selectBars = svg.selectAll('rect')
            .data(barData, function(d) {return d.id; });

        var selectBarsE = selectBars.enter().append('rect')
            .classed('selection', true)
            .attr('x', function (d) { return d.x;})
            .attr('y', function (d) { return d.y;})
            .attr('width', function (d){ return d.width; })
            .attr('height', function(d) { return d.height; })
            .attr('opacity', 0);

        selectBars = selectBars.merge(selectBarsE);

        selectBars.on('click', function(d) {
            activeStep = d.step;
            refreshTimes(times);
            refreshBars(selectBars);
        });





        console.log(points);
        refreshPoints(points);
        refreshLinks(links);
        refreshTimes(times);
        refreshBars(selectBars);


    };

    function refreshLinks(links) {
        links.transition()
            .duration(animationDuration)
            .attr('opacity', getOpacity)
            .attr('y1', function (d) { return getY(d.source); })
            .attr('y2', function (d) { return getY(d.target); });
    }


    function refreshPoints(points) {
        points.transition()
            .duration(animationDuration)
            .attr('opacity', getOpacity)
            .attr('cy', function (d) { return getY(d); });
    }

    function refreshTimes(times) {
        function getX(d) {
            if(activeGraphs[d.movie] && (d.step === activeStep)) {
                return d.x;
            }
            return 0;
        }
        times.transition()
            .duration(animationDuration)
            .attr('x1', getX)
            .attr('x2', getX)
            .attr('opacity', function (d) {
                if (activeGraphs[d.movie] && (d.step === activeStep)) {
                    return 1;
                }
                return 0;
            });

    }

    function refreshBars(bars) {
        function barOpacity(d) {
            if(d.step === activeStep) {
                return 0.3;
            } return 0;
        }
        bars.attr('opacity', barOpacity);
    }


    function getOpacity(d) {
        if(activeGraphs[d.movie]) {
            return 1;
        }
        return 0;
    }

    function getY(d) {
        if(activeGraphs[d.movie]) {
            return d.y
        }
        return start.y;
    }

    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('stroke', 'black');

        var content = '<span class="value">' + d.count + '</span><br/>';

        tooltip.showTooltip(content, d3.event);
    }

    /*
     * Hides tooltip
     */
    function hideDetail(d) {
        // reset outline
        d3.select(this)
            .attr('stroke', d3.rgb(0,0,0,0));

        tooltip.hideTooltip();
    }

    function toggleGraph(movie) {
        activeGraphs[movie] = !activeGraphs[movie];
        refreshPoints(points);
        refreshLinks(links);
        refreshTimes(times)
    }

    /*
     * Externally accessible function (this is attached to the
     * returned chart function). Allows the visualization to toggle
     * between "single group" and "split by year" modes.
     *
     * displayName is expected to be a string and either 'year' or 'all'.
     */
    chart.toggleDisplay = function (displayName) {
        var movie = "";
        switch(displayName) {
            case "dogs":
                movie = "Reservoir Dogs";
                break;
            case "pulp":
                movie = "Pulp Fiction";
                break;
            case "jackie":
                movie = "Jackie Brown";
                break;
            case "bill1":
                movie = "Kill Bill: Vol. 1";
                break;
            case "bill2":
                movie = "Kill Bill: Vol. 2";
                break;
            case "basterds":
                movie = "Inglorious Basterds";
                break;
            case "django":
                movie = "Django Unchained";
                break;
        }
        toggleGraph(movie);
        //console.log(activeGraphs);
    };


    // return the chart function from closure.
    return chart;
}

