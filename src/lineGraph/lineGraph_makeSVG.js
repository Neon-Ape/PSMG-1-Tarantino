// create SVG Container
function makeSVGContainer(selector, width, height) {
    var svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    return svg;
}

// create Y-Axis lines and text
function makeScaleSVG(scaleData, svg) {

    var scale = svg.selectAll('.scale')
        .data(scaleData, function (d) {
            return d.id;
        });

    var scaleE = scale.enter().append('g')
        .classed('scale', true);

    scale = scale.merge(scaleE);

    scale.append('line')
        .attr('x1', function (d) {
            return d.x1;
        })
        .attr('y1', function (d) {
            return d.y1;
        })
        .attr('x2', function (d) {
            return d.x2;
        })
        .attr('y2', function (d) {
            return d.y2;
        });

    scale.append("text")
        .classed('scaleText', true)
        .attr("y", function (d, i) {
            if (i === 0) return d.y1 + 30;
            return d.y1 + VAR_LG_AXIS_TEXT_OFFSET_Y;
        })
        .attr("x", function (d, i) {
            if (i === 0) return d.x2;
            return d.x2 + VAR_LG_AXIS_TEXT_OFFSET_X;
        })
        .attr('text-anchor', 'middle')
        .text(function (d) {
            return d.text;
        });

    return scale;
}

/*
 * create graph links
 * class by movie so styling can be handled by CSS
 */
function makeLinksSVG(linkData, svg) {
    var links = svg.selectAll('.link')
        .data(linkData, function (d) {
            return d.id;
        });

    var linksE = links.enter().append('line')
        .classed('link', true)
        .each(function (d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie), true);
        })
        .attr('x1', function (d) {
            return Number(d.source.x);
        })
        .attr('y1', VAR_LG_NODES_DEFAULT_Y)
        .attr('x2', function (d) {
            return Number(d.target.x);
        })
        .attr('y2', VAR_LG_NODES_DEFAULT_Y)
        .attr('stroke-width', VAR_LG_LINKS_STROKE_WIDTH);

    return links.merge(linksE);
}

/*
 * create graph points
 * class by movie so styling can be handled by CSS
 */
function makePointsSVG(nodeData, svg) {
    var points = svg.selectAll('.bubble')
        .data(nodeData, function (d) {
            return d.id;
        });

    var pointsE = points.enter().append('circle')
        .classed('bubble', true)
        .each(function (d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie), true);
        })
        .attr('r', VAR_LG_NODES_RADIUS)
        .attr('cy', VAR_LG_NODES_DEFAULT_Y)
        .attr('cx', function (d) {
            return Number(d.x)
        });

    return points.merge(pointsE);
}

/*
 * create Timeline
 * each Timeline is a svg <g> element
 * containing a <line> for each timestamped word
 * and a <text> element containing 2 <tspan> to get 2 lines of text
 * everything is classed by movie, styling is handled by CSS where possible
 */
function makeTimelineSVG(nodeData, svg) {
    times = svg.selectAll('g .timeline')
        .data(nodeData, function (d) {
            return d.id;
        });

    var timesE = times.enter().append('g')
        .classed('timeline', true)
        .attr('x1', VAR_LG_TIMELINE_VALUES['x1'])
        .attr('x2', VAR_LG_TIMELINE_VALUES['x2'])
        .attr('y1', VAR_LG_TIMELINE_VALUES['y1'])
        .attr('y2', VAR_LG_TIMELINE_VALUES['y2']);

    times = times.merge(timesE);

    times = addLines(times);
    times = addText(times);

    console.log(times);
    return times;
}

function addLines(times) {
    times.each(function (parentData) {
        d3.select(this).classed(VAR_GET_CLASS(parentData.movie), true);
        d3.select(this).selectAll('line')
            .data(parentData.timeline.times)
            .enter()
            .append('line')
            .classed(VAR_GET_CLASS(parentData.movie), true)
            .attr('x1', VAR_LG_TIMELINE_VALUES['x1'])
            .attr('x2', VAR_LG_TIMELINE_VALUES['x2'])
            .attr('y1', VAR_LG_TIMELINE_VALUES['y1'])
            .attr('y2', VAR_LG_TIMELINE_VALUES['y2'])
            .attr('stroke-width', Number(VAR_LG_TIMELINE_VALUES['stroke-width']))
            .attr('opacity', 0);
    });
    return times;
}

function addText(times) {
    times.append('text')
        .each(function (d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie), true);
        })
        .attr('x', VAR_LG_TIMELINE_TEXT_OFFSET_X)
        .attr('y', 0)
        .attr('text-anchor', 'left');

    times.selectAll('text').append('tspan')
        .attr('x', VAR_LG_TIMELINE_TEXT_OFFSET_X)
        .text(function (d) {
            return d.movie;
        });
    times.selectAll('text').append('tspan')
        .attr('x', VAR_LG_TIMELINE_TEXT_OFFSET_X)
        .attr('dy', '1.0em')
        .text(function (d) {
            return d.timeline.start + " - " + d.timeline.end + " min";
        });
    return times;
}

/*
 Selection bars creation
 */

function makeBarsSVG(barData, svg, separator) {
    var selectBars = svg.selectAll('g .selection')
        .data(barData, function (d) {
            return d.id;
        });

    var selectBarsE = selectBars.enter().append('g');

    selectBars = selectBars.merge(selectBarsE);

    selectBars.append('rect')
        .classed('selection', true)
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        .attr('width', function (d) {
            return d.width;
        })
        .attr('height', function (d) {
            return d.height;
        })
        .attr('opacity', 0);

    selectBars.append('line')
        .classed('selection', true)
        .attr('x1', function (d) {
            return d.x;
        })
        .attr('x2', function (d) {
            return d.x;
        })
        .attr('y1', VAR_LG_GRAPH_HEIGHT)
        .attr('y2', function (d) {
            var step = Math.round((d.step) * 100 / Number(separator));
            if (step % 10 === 0) {
                return VAR_LG_GRAPH_HEIGHT + VAR_LG_BARS_LINE_HEIGHT_BIG;
            }
            return VAR_LG_GRAPH_HEIGHT + VAR_LG_BARS_LINE_HEIGHT;
        })
        .attr('stroke-width', VAR_LG_BARS_LINE_WIDTH);

    selectBars.append('text')
        .classed('selection', true)
        .attr("y", function (d) {
            return d.y + VAR_LG_BARS_TEXT_OFFSET_Y;
        })
        .attr("x", function (d) {
            return d.x + VAR_LG_BARS_TEXT_OFFSET_X;
        })
        .attr('text-anchor', 'middle')
        .text(function (d, i) {
            var text = Math.round((d.step) * 100 / Number(separator));
            if (text % 10 === 0) {
                return text + "%";
            }
            return "";
        });

    return selectBars;
}