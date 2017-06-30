function lineGraph(){
    // Constants for sizing
    var width = 1000;
    var height = 400;
    var yOffset = 100;

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 240);

    var start = {x: width/2, y: height - 10};

    var activeGraphs = {
        "Reservoir Dogs" : true,
        "Pulp Fiction" : false,
        "Jackie Brown" : false,
        "Kill Bill: Vol. 1" : false,
        "Kill Bill: Vol. 2" : false,
        "Inglorious Basterds" : false,
        "Django Unchained" : false
    };

    var xAxis = [
        {
            x1: width/10,
            y1: height-yOffset,
            x2: width*9/10,
            y2: height-yOffset
        }
    ];


    // These will be set in create_nodes and create_vis
    var svg = null;
    var points = null;
    var links = null;
    var nodes = [];

    // Nice looking colors - no reason to buck the trend
    // @v4 scales now have a flattened naming scheme
    var fillColor = d3.scaleOrdinal()
        .domain(['Reservoir Dogs', 'Pulp Fiction', 'Jackie Brown', 'Kill Bill: Vol. 1', 'Kill Bill: Vol. 2', 'Death Proof', 'Inglorious Basterds', 'Django Unchained', 'Hateful Eight'])
        .range(['#D8341A', '#C2A225', '#14A622', '#9C4917','#D826BA','#BDC8E7','#305060','#505050', '#AAAAAA']);

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
        function Node(movie, count, x, words, separator) {
            this.movie = movie;
            this.count = count;
            this.x = x;
            this.y = rawHeight - count * 4;
            this.words = words;
            this.separator = separator;
        }

        var width = rawWidth*8/10;
        var offset = rawWidth/10;
        var pixelPerSeparator = width/separator;

        var myNodes = [];

        for (var movie in data){

            var runtime = data[movie].runtime;
            var minsPerSeparator = runtime/separator;
            //console.log(movie + " --- width: " + width + ", runtime: " + runtime + ", pixelPerSeparator: " + pixelPerSeparator + ", minsPerSeparator: " + minsPerSeparator);
            var currentTimeSlot = minsPerSeparator;
            var currentXPos = offset;

            var currentSeparator = 1;

            var collectorNode = {
                count : 0,
                words : {}
            };

            for (time in data[movie].children) {

                while (time > currentTimeSlot) {
                    myNodes.push(new Node(movie, collectorNode.count, currentXPos, collectorNode.words, currentSeparator));
                    collectorNode.words = [];
                    collectorNode.count = 0;
                    currentTimeSlot += minsPerSeparator;
                    currentXPos += pixelPerSeparator;
                    currentSeparator ++;
                }

                collectorNode.words[time] = data[movie].children[time];
                collectorNode.count++;
            }
            // add last Node
            if (collectorNode.count !== 0) {
                myNodes.push(new Node(movie, collectorNode.count, currentXPos, collectorNode.words, currentSeparator));
                collectorNode.words = [];
                collectorNode.count = 0;
                currentTimeSlot += minsPerSeparator;
                currentXPos += pixelPerSeparator;
                currentSeparator ++;
            }

            while(currentTimeSlot <= runtime ) {
                myNodes.push(new Node(movie, collectorNode.count, currentXPos, collectorNode.words, currentSeparator));
                collectorNode.words = [];
                collectorNode.count = 0;
                currentTimeSlot += minsPerSeparator;
                currentXPos += pixelPerSeparator;
                currentSeparator ++;
            }


        };

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
    var chart = function chart(selector, rawData, separator) {

        if(typeof(separator)==='undefined') {
            separator = 10;
        }

        // convert raw data into nodes data
        nodes = createNodes(rawData, separator, width, height - yOffset);
        links = createLinks(nodes);
        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Bind nodes data to what will become DOM elements to represent them.
        links = svg.selectAll('.link')
            .data(links, function (d) { return d.id; });

        points = svg.selectAll('.bubble')
            .data(nodes, function (d) { return d.id; });

        var axis = svg.selectAll('.axis')
            .data(xAxis, function (d) { return d.id; });

        console.log(xAxis);
        console.log(axis);

        var axisE = axis.enter().append('line')
            .classed('axis', true)
            .attr('x1', function (d) { return d.x1;})
            .attr('y1', function (d) { return d.y1;})
            .attr('x2', function (d) { return d.x2;})
            .attr('y2', function (d) { return d.y2;})
            .attr('stroke', '#000')
            .attr('stroke-width', 2);

        console.log(axisE);

        axis = axis.merge(axisE);

        console.log(axis);

        // uncomment commented lines for dotted links
        var linksE = links.enter().append('line')
            .classed('link', true)
            .attr('x1', function (d) { return Number(d.source.x);})
            .attr('y1', start.y)
            .attr('x2', function (d) { return Number(d.target.x);})
            .attr('y2', start.y)
            .attr('stroke', function (d) { return d3.rgb(fillColor(d.movie));})
            //.attr('stroke-linecap', 'round')
            //.attr('stroke-dasharray', '1, 30')
            .attr('stroke-width', 5);

        links = links.merge(linksE);

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        var pointsE = points.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 10)
            .attr('cy', start.y)
            .attr('fill', function (d) { return d3.rgb(fillColor(d.movie));})
            .attr('cx', function (d) { return Number(d.x)})
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail);

        // @v4 Merge the original empty selection and the enter selection
        points = points.merge(pointsE);



        console.log(points);
        refreshPoints(points);
        refreshLinks(links);

    };

    function refreshLinks(links) {
        links.transition()
            .duration(1000)
            .attr('opacity', getOpacity)
            .attr('y1', function (d) { return getY(d.source); })
            .attr('y2', function (d) { return getY(d.target); });
    }

    function refreshPoints(points) {
        points.transition()
            .duration(1000)
            .attr('opacity', getOpacity)
            .attr('cy', function (d) { return getY(d); });
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

        var content = '<span class="name">separator</span><span class="value">: ' + d.separator + '</span><br/>';

        for(var word in d.words) {
            if(d.words.hasOwnProperty(word)) {
                content += '<span class="name">' + word + '</span><span class="value">: ' + d.words[word] + '</span><br/>'
            }
        }

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

