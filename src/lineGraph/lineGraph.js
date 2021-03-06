function lineGraph() {

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip(VAR_LG_TOOLTIP_TITLE, VAR_LG_TOOLTIP_WIDTH);

    var currentSeparator = null;

    /*
     This object manages the graphs and keeps track of activity
     Also provides methods for toggling and resizing graphs
     Default selected movie, activeStep and hoveredStep are set.
      */
    var graphs = {
        _height: VAR_LC_TIMELINE_HEIGHT,
        _active: ["Reservoir Dogs"],
        activeStep: 1,
        hoveredStep: -1,
        isActive: function (movie) {
            return this._active.indexOf(movie) !== -1;
        },
        toggle: function (movie) {
            if (this.isActive(movie)) {
                this._active.splice(this._active.indexOf(movie), 1);
            } else {
                this._active.push(movie);
            }
        },
        size: function () {
            return (this._active.length + 1) * this._height;
        },
        getY1: function (movie) {
            if (this.isActive(movie)) {
                return this._active.indexOf(movie) * this._height;
            }
            return this._active.length * this._height;
        },
        getY2: function (movie) {
            return this.getY1(movie) + this._height;
        }
    };



    // Initiate jankiest of hacks to get a 100% on the x-Axis, i am not proud of this
    // 100% x axis value is generated by y Axis graphics, which need extra ifs to handle it
    // x-Axis can't handle it because x-Axis is bound so selection bars,
    // which have a step less then the x-Axis does.
    var hundredPercent = {
        x1: VAR_LG_GRAPH_OFFSET_X + VAR_LG_GRAPH_WIDTH,
        x2: VAR_LG_GRAPH_OFFSET_X + VAR_LG_GRAPH_WIDTH,
        y1: VAR_LG_GRAPH_HEIGHT,
        y2: VAR_LG_GRAPH_HEIGHT + VAR_LG_BARS_LINE_HEIGHT_BIG,
        text: '100%'
    };

    var svg2 = null;
    var points = null;
    var links = null;
    var bars = null;
    var times = null;
    var scaleStep = null;

    /*
     * Main entry point to the line graph. This function is returned
     * by the parent closure. It prepares the rawData for visualization
     * and adds an svg element to the provided selector and starts the
     * visualization creation process.
     *
     * selector is expected to be a DOM element or CSS selector that
     * points to the parent element of the line graph. Inside this
     * element, the code will add the SVG container for the visualization.
     *
     * rawData is expected to be an array of data objects as provided by
     * a d3 loading function like d3.csv.
     */
    var chart = function chart(selector, selector2, rawData, separator) {
        if (typeof(separator) === 'undefined') {
            separator = VAR_LG_DEFAULT_SEPARATOR;
        }

        // calculate activeStep on step change
        calculateActiveStep(currentSeparator, separator);
        currentSeparator = separator;

        // convert raw data into nodes data
        var nodeData = createNodes(rawData, separator);
        var linkData = createLinks(nodeData);
        var barData = createBars(separator);
        var scaleMax = calculateScaleStep(nodeData);
        scaleStep = VAR_LG_AXIS_HEIGHT / scaleMax;
        var scaleData = createScale(scaleStep, scaleMax);

        // Add 100% x-Axis step to y-Axis Data, because logic
        scaleData.splice(0,0,hundredPercent);

        // Create a SVG element inside the provided selector
        // with desired size.
        svg = makeSVGContainer(selector, VAR_LG_SVG_WIDTH, VAR_LG_SVG_HEIGHT);
        svg2 = makeSVGContainer(selector2, VAR_LG_SVG2_WIDTH, VAR_LG_SVG2_HEIGHT);

        // Create Graph svg Elements
        makeScaleSVG(scaleData, svg);
        points = makePointsSVG(nodeData, svg);
        links = makeLinksSVG(linkData, svg);
        bars = makeBarsSVG(barData, svg, separator);

        // Create timeline svg Elements
        times = makeTimelineSVG(nodeData, svg2);

        // set mouse behaviour
        setTimesHover();
        setBarsHover();
        setBarsClick();

        // set everything to the right value
        refreshGraph();
        refreshTimeline();
    };

    function refreshGraph() {
        refreshPoints();
        refreshLinks();
        refreshBars();
    }

    /*
        Check all data points against the active movies
        and change line opacity and y coordinates accordingly
     */
    function refreshLinks() {
        links.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', getOpacity)
            .attr('y1', function (d) {
                return getY(d.source);
            })
            .attr('y2', function (d) {
                return getY(d.target);
            });
    }

    /*
     Check all data points against the active movies
     and change point opacity and y coordinates accordingly
     */
    function refreshPoints() {
        points.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', getOpacity)
            .attr('cy', function (d) {
                return getY(d);
            });
    }

    /*
    * the first bar is set to VAR_LG_BARS_OPACITY
    * any user selected bars (hovered before clicked) are set a bit higher
    * so they are the same opacity once the mouseout decreases the opacity
    */
    function refreshBars() {
        function barOpacity(d) {
            if (d.step === graphs.activeStep) {
                if (d.step === graphs.hoveredStep) {
                    return VAR_LG_BARS_OPACITY + VAR_LG_BARS_HOVER_OPACITY;
                }
                return VAR_LG_BARS_OPACITY;
            }
            return 0;
        }

        bars.select('rect').attr('opacity', barOpacity);
    }

    function refreshTimeline() {

        // set opacity according to active status
        times.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', function (d) {
                if (graphs.isActive(d.movie) && (d.step === graphs.activeStep)) {
                    return 1;
                }
                return 0;
            });

        times.each(function (parentData) {
            fadeLines(this, parentData);
            fadeText(this, parentData);
        });
    }
    /*
     Inactive timelines:
     > transition xPos to 0
     > transition yPos to graph stack height
     > transition opacity to 0

     Active timelines:
     > transition xPos to x in data
     > yPos is already correct
     > transition opacity to 1
     */
    function fadeLines(thisTime, parentData) {
        d3.select(thisTime).selectAll('line')
            .transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('x1', function (d, i) {
                return getX(parentData, parentData.timeline.times[i])
            })
            .attr('x2', function (d, i) {
                return getX(parentData, parentData.timeline.times[i])
            })
            .attr('y1', graphs.getY1(parentData.movie))
            .attr('y2', graphs.getY2(parentData.movie))
            .attr('opacity', function () {
                if (graphs.isActive(parentData.movie) && (parentData.step === graphs.activeStep)) {
                    return 1;
                }
                return 0;
            });
    }

    function fadeText(thisTime, parentData) {
        d3.select(thisTime).selectAll('text')
            .transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('y', graphs.getY1(parentData.movie)+VAR_LC_TIMELINE_HEIGHT/2);
    }

    function getOpacity(d) {
        if (graphs.isActive(d.movie)) {
            return 1;
        }
        return 0;
    }

    // return y values depending on the current scale
    function getY(d) {
        if (graphs.isActive(d.movie)) {
            return VAR_LG_GRAPH_HEIGHT - d.y * (scaleStep / 10)
        }
        return VAR_LG_NODES_DEFAULT_Y;
    }

    // get x value according to parents movie and step status
    function getX(parentData, d) {
        if (graphs.isActive(parentData.movie) && (parentData.step === graphs.activeStep)) {
            return d.x;
        }
        return 0;
    }

    /*
    * sets active step to the selected bar.
    * refreshes timeline and bars
    */
    function setBarsClick() {
        bars.on('click', function (d) {
            graphs.activeStep = d.step;
            refreshTimeline(times);
            refreshBars(bars);
        });

    }

    /*
     * on mouseover a bars opacity is increased by VAR_LG_BARS_HOVER_OPACITY
     * this highlights unselected as well as selected bars well
     */
    function setBarsHover() {
        bars.select('rect').on('mouseover', function (d) {
            var o = Number(d3.select(this).attr('opacity'));
            d3.select(this).attr('opacity', o + VAR_LG_BARS_HOVER_OPACITY);
            graphs.hoveredStep = d.step;
        })
            .on('mouseout', function () {
                var o = Number(d3.select(this).attr('opacity'));
                d3.select(this).attr('opacity', o - VAR_LG_BARS_HOVER_OPACITY);
                graphs.hoveredStep = -1;
            });
    }

    /*
     * on mouseover lines get bigger
     * on mouseout they return to normal
     */
    function setTimesHover() {
        times.each(function (parentData) {
            d3.select(this).selectAll('line')
                .on('mouseover', function (d,i) {
                    var t = d3.select(this);
                    t.attr('y1', t.attr('y1') - VAR_LG_TIMELINE_HOVER_OFFSET);
                    t.attr('y2', Number(t.attr('y2')) + VAR_LG_TIMELINE_HOVER_OFFSET);
                    t.attr('stroke-width', VAR_LG_TIMELINE_HOVER_WIDTH);
                    showDetail(parentData.timeline.times[i]);
                })
                .on('mouseout', function () {
                    var t = d3.select(this);
                    t.attr('y1', Number(t.attr('y1')) + VAR_LG_TIMELINE_HOVER_OFFSET);
                    t.attr('y2', t.attr('y2') - VAR_LG_TIMELINE_HOVER_OFFSET);
                    t.attr('stroke-width', VAR_LG_TIMELINE_VALUES['stroke-width']);
                    hideDetail();
                });

        });
    }

    /*
     * Function called on mouseover to display the
     * details of a curse word in the tooltip.
     */
    function showDetail(d) {
        var content = '<span class="name">' + d.time + '</span>: <span class="value">' + d.word + '</span><br/>';
        tooltip.showTooltip(content, d3.event);
    }

    /*
     * Hides tooltip
     */
    function hideDetail() {

        tooltip.hideTooltip();
    }

    /*
     * Recalculates the step so its still at the same relative position in the graph
     * Works perfect if the step is available in both separator values
     * if not it walks around a bit
     * 3% step to anywhere or the other way round doesn't work well
     */
    function calculateActiveStep(oldSeparator, newSeparator) {
        var oldStep = graphs.activeStep;

        var newStep = Math.floor((newSeparator / oldSeparator) * oldStep);
        if (oldStep >= oldSeparator - 1) {
            newStep = newSeparator - 1;
        }
        console.log("(" + oldSeparator + ", " + oldStep + ") changed to (" + newSeparator + ", " + newStep + ")");
        graphs.activeStep = newStep;
    }

    // a clicked movie gets toggled in the graph object and
    function toggleGraph(movie) {
        graphs.toggle(movie);
        refreshGraph();
        refreshTimeline();
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
        switch (displayName) {
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

    // removes the existing svg Elements
    chart.remove = function () {
        d3.select('#lineGraph').selectAll('svg').remove();
        d3.select('#timeline').selectAll('svg').remove();
    };

    // return the chart function from closure.
    return chart;
}

