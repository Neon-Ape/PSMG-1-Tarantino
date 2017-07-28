function lineGraph() {

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 100);

    var currentSeparator = null;

    var graphs = {
        _height: VAR_LC_TIMELINE_HEIGHT,
        _active: ["Reservoir Dogs"],
        activeStep: 0,
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


    function Step(step, scaleStep) {
        this.x1 = 0;
        this.y1 = VAR_LG_GRAPH_HEIGHT - step * scaleStep;
        this.x2 = VAR_LG_GRAPH_CUTOFF_X;
        this.y2 = VAR_LG_GRAPH_HEIGHT - step * scaleStep;
        this.text = step * 10;
    }

    // Initiate jankiest of hacks to get a 0 on the x-Axis, i am not proud of this
    var zero = {
        x1: VAR_LG_GRAPH_OFFSET_X + VAR_LG_GRAPH_WIDTH,
        x2: VAR_LG_GRAPH_OFFSET_X + VAR_LG_GRAPH_WIDTH,
        y1: VAR_LG_GRAPH_HEIGHT,
        y2: VAR_LG_GRAPH_HEIGHT + VAR_LG_BARS_LINE_HEIGHT_BIG,
        text: '100%'
    };

    var svg2 = null;

    var points = null;
    var links = null;
    var times = null;

    var scaleStep = null;

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
        if (typeof(separator) === 'undefined') {
            separator = VAR_LG_DEFAULT_SEPARATOR;
        }

        calculateActiveStep(currentSeparator, separator);
        currentSeparator = separator;

        // convert raw data into nodes data
        var nodeData = createNodes(rawData, separator);
        var linkData = createLinks(nodeData);
        var barData = createBars(separator);

        var scaleMax = Math.ceil(d3.max(nodeData, function (d) {
                return d.count;
            }) / 10);
        console.log(scaleMax);
        var scaleData = [zero];
        scaleStep = VAR_LG_AXIS_HEIGHT / scaleMax;
        for (var i = 0; i <= scaleMax; i++) {
            scaleData.push(new Step(i, scaleStep))
        }


        // Create a SVG element inside the provided selector
        // with desired size.
        var svg = d3.select(selector)
            .append('svg')
            .attr('width', VAR_LG_SVG_WIDTH)
            .attr('height', VAR_LG_SVG_HEIGHT);

        svg2 = d3.select(selector2)
            .append('svg')
            .attr('width', VAR_LG_SVG2_WIDTH)
            .attr('height', VAR_LG_SVG2_HEIGHT);

        makeScaleSVG(scaleData, svg);
        points = makePointsSVG(nodeData, svg);
        links = makeLinksSVG(linkData, svg);
        times = makeTimelineSVG(nodeData, svg2);
        var bars = makeBarsSVG(barData, svg, separator);

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


        bars.on('click', function (d) {
            graphs.activeStep = d.step;
            refreshTimes(times);
            refreshBars(bars);
        });

        bars.select('rect').on('mouseover', function (d) {
            var o = Number(d3.select(this).attr('opacity'));
            d3.select(this).attr('opacity', o + 0.08);
            graphs.hoveredStep = d.step;
        })
            .on('mouseout', function () {
                var o = Number(d3.select(this).attr('opacity'));
                d3.select(this).attr('opacity', o - 0.08);
                graphs.hoveredStep = -1;
            });


        console.log(points);
        refreshPoints(points);
        refreshLinks(links);
        refreshTimes(times);
        refreshBars(bars);


    };

    function refreshLinks(links) {
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


    function refreshPoints(points) {
        points.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', getOpacity)
            .attr('cy', function (d) {
                return getY(d);
            });
    }

    function refreshTimes(times) {
        function getX(parentData, d) {
            if (graphs.isActive(parentData.movie) && (parentData.step === graphs.activeStep)) {
                return d.x;
            }
            return 0;
        }

        times.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', function (d) {
                if (graphs.isActive(d.movie) && (d.step === graphs.activeStep)) {
                    return 1;
                }
                return 0;
            });

        times.each(function (parentData) {
            d3.select(this).selectAll('line')
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
            d3.select(this).selectAll('text')
                .transition()
                .duration(VAR_LG_ANIMATION_DURATION)
                .attr('y', graphs.getY1(parentData.movie)+VAR_LC_TIMELINE_HEIGHT/2);
        });

    }

    function refreshBars(bars) {
        function barOpacity(d) {
            if (d.step === graphs.activeStep) {
                if (d.step === graphs.activeStep) {
                    return VAR_LG_BARS_OPACITY + VAR_LG_BARS_HOVER_OPACITY;
                }
                return VAR_LG_BARS_OPACITY;
            }
            return 0;
        }

        bars.select('rect').attr('opacity', barOpacity);
    }


    function getOpacity(d) {
        if (graphs.isActive(d.movie)) {
            return 1;
        }
        return 0;
    }

    function getY(d) {
        if (graphs.isActive(d.movie)) {
            return VAR_LG_GRAPH_HEIGHT - d.y * (scaleStep / 10)
        }
        return VAR_LG_NODES_DEFAULT_Y;
    }

    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
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

    function calculateActiveStep(oldSeparator, newSeparator) {
        var oldStep = graphs.activeStep;

        var newStep = Math.floor((newSeparator / oldSeparator) * oldStep);
        if (oldStep >= oldSeparator - 1) {
            newStep = newSeparator - 1;
        }
        console.log("(" + oldSeparator + ", " + oldStep + ") changed to (" + newSeparator + ", " + newStep + ")");
        graphs.activeStep = newStep;
    }

    function toggleGraph(movie) {
        graphs.toggle(movie);
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


    chart.remove = function () {
        d3.select('#lineGraph').selectAll('svg').remove();
        d3.select('#timeline').selectAll('svg').remove();
    };


    // return the chart function from closure.
    return chart;
}

