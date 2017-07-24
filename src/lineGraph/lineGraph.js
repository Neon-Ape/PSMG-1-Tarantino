function lineGraph(){

    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 100);
    
    var graphs = {
        _height : VAR_LC_TIMELINE_HEIGHT,
        _active : ["Reservoir Dogs"],
        isActive : function (movie) {
            return this._active.indexOf(movie) !== -1;
        },
        toggle : function (movie) {
            if(this.isActive(movie)) {
                this._active.splice(this._active.indexOf(movie),1);
            } else {
                this._active.push(movie);
            }
        },
        size : function() {
            return (this._active.length + 1) * this._height;
        },
        getY1 : function (movie) {
            if(this.isActive(movie)) {
                return this._active.indexOf(movie) * this._height;
            } return this._active.length * this._height;
        },
        getY2 : function (movie) {
            if(this.isActive(movie)) {
                return (this._active.indexOf(movie)+1) * this._height;
            } return (this._active.length + 1) * this._height;
        }

    };
    
    var activeStep = 0;
    var hoveredStep = -1;

    function Step(step,scaleStep) {
            this.x1 = 0;
            this.y1 = VAR_LG_GRAPH_HEIGHT-step*scaleStep;
            this.x2 = VAR_LG_GRAPH_CUTOFF_X;
            this.y2 = VAR_LG_GRAPH_HEIGHT-step*scaleStep;
            this.text = step;
    }
    var scaleStep = VAR_LG_AXIS_STEP_HEIGHT;
    var scaleData = [];
    for (var i=0; i<8; i++) {
          scaleData.push(new Step(i,scaleStep))
    }

    var svg2 = null;

    var points = null;
    var links = null;
    var times = null;

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
            separator = VAR_LG_DEFAULT_SEPARATOR;
        }

        // convert raw data into nodes data
        var nodeData = createNodes(rawData, separator);
        var linkData = createLinks(nodeData);
        var timeData = createTimes(nodeData);
        var barData = createBars(nodeData);
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

        var scale = makeScaleSVG(scaleData, svg);
        var scaleText = makeScaleTextSVG(scaleData, svg);
        points = makePointsSVG(nodeData, svg);
        links = makeLinksSVG(linkData, svg);
        times = makeTimelineSVG(timeData, svg2);
        var bars = makeBarsSVG(barData, svg);

        times.on('mouseover', function (d) {
                var t = d3.select(this);
                t.attr('y1', t.attr('y1')-VAR_LG_TIMELINE_HOVER_OFFSET);
                t.attr('y2', Number(t.attr('y2'))+VAR_LG_TIMELINE_HOVER_OFFSET);
                t.attr('stroke-width', VAR_LG_TIMELINE_HOVER_WIDTH);
                showDetail(d);
            })
            .on('mouseout', function () {
            var t = d3.select(this);
            t.attr('y1', Number(t.attr('y1'))+VAR_LG_TIMELINE_HOVER_OFFSET);
            t.attr('y2', t.attr('y2')-VAR_LG_TIMELINE_HOVER_OFFSET);
            t.attr('stroke-width', VAR_LG_TIMELINE_VALUES['stroke-width']);
            hideDetail();
            });

        bars.on('click', function(d) {
            activeStep = d.step;
            refreshTimes(times);
            refreshBars(bars);
        });

        bars.on('mouseover', function (d) {
                var o = Number(d3.select(this).attr('opacity'));
                d3.select(this).attr('opacity',o+0.08);
                hoveredStep = d.step;
            })
            .on('mouseout', function (d) {
                var o = Number(d3.select(this).attr('opacity'));
                d3.select(this).attr('opacity',o-0.08);
                hoveredStep = -1;
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
            .attr('y1', function (d) { return getY(d.source); })
            .attr('y2', function (d) { return getY(d.target); });
    }


    function refreshPoints(points) {
        points.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('opacity', getOpacity)
            .attr('cy', function (d) { return getY(d); });
    }

    function refreshTimes(times) {
        function getX(d) {
            if(graphs.isActive(d.movie) && (d.step === activeStep)) {
                return d.x;
            }
            return 0;
        }

        times.transition()
            .duration(VAR_LG_ANIMATION_DURATION)
            .attr('x1', getX)
            .attr('x2', getX)
            .attr('y1', function (d) { return graphs.getY1(d.movie); })
            .attr('y2', function (d) { return graphs.getY2(d.movie); })
            .attr('opacity', function (d) {
                if (graphs.isActive(d.movie) && (d.step === activeStep)) {
                    return 1;
                }
                return 0;
            });
    }

    function refreshBars(bars) {
        function barOpacity(d) {
            if(d.step === activeStep) {
                if(d.step === hoveredStep) {
                    return VAR_LG_BARS_OPACITY + VAR_LG_BARS_HOVER_OPACITY;
                }
                return VAR_LG_BARS_OPACITY;
            } return 0;
        }
        bars.attr('opacity', barOpacity);
    }


    function getOpacity(d) {
        if(graphs.isActive(d.movie)) {
            return 1;
        }
        return 0;
    }

    function getY(d) {
        if(graphs.isActive(d.movie)) {
            return d.y
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
    function hideDetail(d) {

        tooltip.hideTooltip();
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

