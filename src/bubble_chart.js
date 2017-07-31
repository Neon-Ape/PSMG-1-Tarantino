/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Basic Code Structure adapted from:
 * http://vallandingham.me//bubble_charts_with_d3v4.html
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
function bubbleChart() {
    // Constants for sizing
    var width = VAR_BC_SVG_WIDTH;
    var height = VAR_BC_SVG_HEIGHT;

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip(VAR_BC_TOOLTIP_TITLE, VAR_BC_TOOLTIP_WIDTH);

    // Locations to move bubbles towards, depending
    // on which view mode is selected.
    var center = VAR_BC_CENTER;

    var movieTitleX = VAR_BC_MOVIE_TITLE_X_LOOKUP;

    var movieCenters = VAR_BC_MOVIE_CENTER_LOOKUP;

    var groupCenters = VAR_BC_GROUP_CENTER_LOOKUP;

    // strength to apply to the position forces
    var forceStrength = VAR_BC_SIMU_FORCE_STRENGTH;

    // These will be set in create_nodes and create_vis
    var svg = null;
    var bubbles = null;
    var nodes = [];

    // Charge function that is called for each node.
    // As part of the ManyBody force.
    // This is what creates the repulsion between nodes.
    //
    // Charge is proportional to the diameter of the
    // circle (which is stored in the radius attribute
    // of the circle's associated data.
    //
    // This is done to allow for accurate collision
    // detection with nodes of different sizes.
    //
    // Charge is negative because we want nodes to repel.
    // Before the charge was a stand-alone attribute
    //  of the force layout. Now we can use it as a separate force!
    function charge(d) {
        return -Math.pow(d.radius, VAR_BC_SIMU_CHARGE_MULTIPLIER) * forceStrength;
    }

    // Here we create a force layout and
    // We create a force simulation now and
    //  add forces to it.
    var simulation = d3.forceSimulation()
        .velocityDecay(VAR_BC_SIMU_VELOCITY_DECAY)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);

    // Force starts up automatically,
    //  which we don't want as there aren't any nodes yet.
    simulation.stop();

    // Nice looking colors - no reason to buck the trend
    // scales now have a flattened naming scheme
    var fillColor = d3.scaleOrdinal()
        .domain(['ass', 'shit', 'fuck', 'racial', 'genital', 'blasphemy', 'other'])
        .range(['#fdfdfd', '#d4d4d4', '#aaaaaa', '#7f7f7f', '#555555', '#2a2a2a', '#070707']);


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
    function createNodes(curseWords) {
        var maxAmount = d3.max(curseWords.children, function (d) {
            return +d.value;
        });


        // Sizes bubbles based on area.
        var radiusScale = d3.scalePow()
            .exponent(VAR_BC_SIMU_SCALE_POW['exponent'])
            .range([VAR_BC_SIMU_SCALE_POW['range']['low'], VAR_BC_SIMU_SCALE_POW['range']['high']])
            .domain([0, maxAmount]);

        var myNodes = curseWords.children.map(function (d) {
            return {
                radius: radiusScale(+d.value),
                value: +d.value,
                name: d.name,
                movie: d.movie,
                year: d.year,
                group: d.group,
                x: Math.random() * VAR_BC_X_RANDOM_MULTIPLIER,
                y: Math.random() * VAR_BC_Y_RANDOM_MULTIPLIER
            };
        });

        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) {
            return b.value - a.value;
        });
        console.log(myNodes);
        return myNodes;


    }



    function makeBubbles(svg, nodes) {
        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.bubble')
            .data(nodes, function (d) {
                return d.id;
            });

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // Class the bubbles by group, so styling can be handled in CSS
        var bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .each(function (d) {
                d3.select(this).classed(d.group, true);
            })
            .attr('r', 0)
            .attr('stroke-width', VAR_BC_SVG_BUBBLE_STROKE_WIDTH)
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail);

        // Merge the original empty selection and the enter selection
        bubbles = bubbles.merge(bubblesE);

        return bubbles;
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
        // convert raw data into nodes data
        //nodes = createNodes(rawData);
        nodes = createNodes(rawData);
        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // create bubbles in the selected SVG element with the selected Data
        var bubbles = makeBubbles(svg, nodes);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
            .duration(VAR_BC_ANIMATION_DURATION)
            .attr('r', function (d) {
                return d.radius;
            });

        // Set the simulation's nodes to our newly created nodes array.
        // Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);

        // Set initial layout to single group.
        groupBubbles();
    };

    /*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y values of their bound node data.
     * These x and y values are modified by the force simulation.
     */
    function ticked() {
        bubbles
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });
    }

    /*
     * Provides a x value for each node to be used with the split by movie
     */
    function nodeMoviePosX(d) {
        return movieCenters[d.movie].x;
    }

    /*
     * Provides a y value for each node to be used with the split by movie
     */
    function nodeMoviePosY(d) {
        return movieCenters[d.movie].y;
    }

    /*
     * Provides a y value for each node to be used with the split by group
     */
    function nodeGroupPos(d) {
        return groupCenters[d.group].y;
    }

    /*
     * Sets visualization in "single group mode".
     * The movie labels are hidden and the force layout
     * tick function is set to move all nodes to the
     * center of the visualization.
     */
    function groupBubbles() {
        hideMovieTitles();

        // Reset the 'x' and 'y' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
        simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

        // We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }


    /*
     * Sets visualization in "split by movie mode".
     * The movie title labels are shown and the force layout
     * tick function is set to move nodes to the
     * movieTitleCenter of their data's movie.
     */
    function splitBubbles() {
        showMovieTitles();

        // Reset the 'x' and 'y' force to draw the bubbles to their movie center
        simulation.force('x', d3.forceX().strength(forceStrength).x(nodeMoviePosX));
        simulation.force('y', d3.forceY().strength(forceStrength).y(nodeMoviePosY));


        // We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }


    /*
     * Sets visualization in "split by group mode".
     * The force layout tick function is set to move nodes to the
     * groupCenter of their data's group.
     */
    function vertSplitBubbles() {
        // Reset the 'y' force to draw the bubbles to their group center
        simulation.force('y', d3.forceY().strength(forceStrength).y(nodeGroupPos));


        // We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();

    }

    /*
     * Hides Movie title displays.
     */
    function hideMovieTitles() {
        svg.selectAll('.movietitle').remove();
    }

    /*
     * Shows Movie title displays.
     */
    function showMovieTitles() {
        // Another way to do this would be to create
        // the movie texts once and then just hide them.
        var moviesData = d3.keys(movieTitleX);
        var movieTitles = svg.selectAll('.movietitle')
            .data(moviesData);

        movieTitles.enter().append('text')
            .attr('class', 'movietitle')
            .attr('x', function (d) {
                return movieTitleX[d];
            })
            .attr('y', VAR_BC_SVG_MOVIE_TITLES_Y)
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d;
            });
    }

    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('stroke', 'black');

        var content = '<span class="name">Word: </span><span class="value">' +
            d.name +
            '</span><br/>' +
            '<span class="name">Amount: </span><span class="value">' +
            d.value +
            '</span><br/>' +
            '<span class="name">Movie: </span><span class="value">' +
            d.movie +
            '</span><br/>' +
            '<span class="name">Year: </span><span class="value">' +
            d.year +
            '</span>';

        tooltip.showTooltip(content, d3.event);
    }

    /*
     * Hides tooltip
     */
    function hideDetail(d) {
        // reset outline
        d3.select(this)
            .attr('stroke', d3.rgb(fillColor(d.group)).darker());

        tooltip.hideTooltip();
    }

    /*
     * Externally accessible function (this is attached to the
     * returned chart function). Allows the visualization to toggle
     * between "single group", "split by movie" and "split by group" modes.
     *
     * displayName is expected to be a string and either 'movie', 'group' or 'all'.
     */
    chart.toggleDisplay = function (displayName) {
        if (displayName === 'movie') {
            splitBubbles();
        } else if (displayName === 'group') {
            vertSplitBubbles();
        } else {
            groupBubbles();
        }
    };


    // return the chart function from closure.
    return chart;
}


