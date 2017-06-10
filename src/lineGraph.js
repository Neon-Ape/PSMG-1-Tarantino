function lineGraph(){
    // Constants for sizing
    var width = 1000;
    var height = 300;

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

    // @v4 strength to apply to the position forces
    var forceStrength = 0.03; //default 0.03

    // These will be set in create_nodes and create_vis
    var svg = null;
    var points = null;
    var links = null;
    var nodes = [];

    // Here we create a force layout and
    // @v4 We create a force simulation now and
    //  add forces to it.
    var simulation = d3.forceSimulation()
        .velocityDecay(0.15)
        .force('x', d3.forceX().strength(forceStrength).x(start.x))
        .force('y', d3.forceY().strength(forceStrength).y(start.y))
        .on('tick', ticked);

    // @v4 Force starts up automatically,
    //  which we don't want as there aren't any nodes yet.
    simulation.stop();

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
    function createNodes(data, separator) {
        function Node(movie, count, x, words) {
            this.movie = movie;
            this.count = count;
            this.x = x;
            this.y = 300 - count * 2;
            this.words = words;
        }

        var myNodes = [];

        for (var movie in data){
            var runtime = data[movie].runtime;

            var currentTimeSlot = runtime/separator;
            var collectorNode = {
                count : 0,
                words : {}
            };
            for (time in data[movie].children) {
                if (time > currentTimeSlot) {
                    myNodes.push(new Node(movie, collectorNode.count, currentTimeSlot * 10, collectorNode.words));
                    collectorNode.words = [];
                    collectorNode.count = 0;
                    currentTimeSlot += separator;
                }
                collectorNode.words[time] = data[movie].children[time];
                collectorNode.count++;
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
    var chart = function chart(selector, rawData) {

        var separator = 20;
        /*
         var maxAmount = d3.max(rawData.children, function (d) { return +d.value; });

         // Sizes bubbles based on area.
         // @v4: new flattened scale names.
         var radiusScale = d3.scalePow()
         .exponent(0.5)
         .range([1, 65])
         .domain([0, maxAmount]);


         */

        // convert raw data into nodes data
        nodes = createNodes(rawData, separator);
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



        var linksE = links.enter().append('line')
            .classed('link', true)
            .attr('x1', function (d) { return Number(d.source.x);})
            .attr('y1', function (d) { return Number(d.source.y);})
            .attr('x2', function (d) { return Number(d.target.x);})
            .attr('y2', function (d) { return Number(d.target.y);})
            .attr('stroke', function (d) { return d3.rgb(fillColor(d.movie));})
            .attr('stroke-width', 4);

        links = links.merge(linksE);

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        var pointsE = points.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 20)
            .attr('fill', d3.rgb(0,0,0,255))
            .attr('cx', function (d) { return Number(d.x)})
            .attr('cy', function (d) { return Number(d.y)})
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail);

        // @v4 Merge the original empty selection and the enter selection
        points = points.merge(pointsE);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        points.transition()
            .duration(2000)
            .attr('y', function (d) { return d.y; });
        /*
        links.transition()
            .duration(2000)
            .attr('y1', function (d) { return d.source.y })
            .attr('y2', function (d) { return d.target.y });
        */

        console.log(points);
        console.log(links);

        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(points);


        setStartState();

    };

    /*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y values of their bound node data.
     * These x and y values are modified by the force simulation.
     * TODO: links
     */
    function ticked() {
        points
            .attr('cx', getX)
            .attr('cy', getY);

        links
            .attr('x1', getX)
            .attr('y1', getY)
            .attr('x2', getX)
            .attr('y2', getY);

    }


    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('stroke', 'black');

        var content = "";

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

    function getX(d) {
        if(activeGraphs[d.movie]) {
            return d.x;
        }
        return start.x;
    }

    function getY(d) {
        if(activeGraphs[d.movie]) {
            return d.y
        }
        return start.y;
    }


    function setStartState() {
        // @v4 Reset the 'x' force to draw the bubbles to their year center
        simulation.force('x', d3.forceX().strength(forceStrength).x(getX));
        simulation.force('y', d3.forceY().strength(forceStrength).y(getY));


        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }

    function toggleGraph(movie) {
        activeGraphs[movie] = !activeGraphs[movie];
        simulation.alpha(1).restart();
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
        console.log(activeGraphs);
    };


    // return the chart function from closure.
    return chart;
}

