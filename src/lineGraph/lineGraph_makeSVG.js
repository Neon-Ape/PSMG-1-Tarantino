function makeScaleSVG(scaleData, svg) {

    var scale = svg.selectAll('.scale')
        .data(scaleData, function (d) {return d.id;});

    var scaleE = scale.enter().append('line')
        .classed('scale', true)
        .attr('x1', function (d) {return d.x1;})
        .attr('y1', function (d) {return d.y1;})
        .attr('x2', function (d) {return d.x2;})
        .attr('y2', function (d) {return d.y2;});

    return scale.merge(scaleE);
}

function makeScaleTextSVG(scaleData, svg) {
    var scaleText = svg.selectAll('.scaleText')
        .data(scaleData, function (d) { return d.id; });

    scaleTextE = scaleText.enter().append("text")
        .classed('scaleText', true)
        .attr("y", function (d) { return d.y1+VAR_LG_AXIS_TEXT_OFFSET_Y;})
        .attr("x", function(d){ return d.x2+VAR_LG_AXIS_TEXT_OFFSET_X;})
        .attr('text-anchor', 'middle')
        .text(function (d) { return d.text;});

    return scaleText.merge(scaleTextE);
}

function makeLinksSVG(linkData, svg) {
    var links = svg.selectAll('.link')
        .data(linkData, function (d) { return d.id; });

    var linksE = links.enter().append('line')
        .classed('link', true)
        .each(function(d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie),true);})
        .attr('x1', function (d) { return Number(d.source.x);})
        .attr('y1', VAR_LG_NODES_DEFAULT_Y)
        .attr('x2', function (d) { return Number(d.target.x);})
        .attr('y2', VAR_LG_NODES_DEFAULT_Y)
        .attr('stroke-width', VAR_LG_LINKS_STROKE_WIDTH);

    return links.merge(linksE);
}

function makePointsSVG(nodeData, svg) {
    var points = svg.selectAll('.bubble')
        .data(nodeData, function (d) { return d.id; });

    var pointsE = points.enter().append('circle')
        .classed('bubble', true)
        .each(function(d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie),true);})
        .attr('r', VAR_LG_NODES_RADIUS)
        .attr('cy', VAR_LG_NODES_DEFAULT_Y)
        .attr('cx', function (d) { return Number(d.x)});

    return points.merge(pointsE);
}

function makeTimelineSVG(timeData, svg) {
    times = svg.selectAll('.circle')
        .data(timeData, function (d) { return d.id; });

    var timesE = times.enter().append('line')
        .classed('timeStamp', true)
        .each(function(d) {
            d3.select(this).classed(VAR_GET_CLASS(d.movie),true);})
        .attr('x1', VAR_LG_TIMELINE_VALUES['x1'])
        .attr('x2', VAR_LG_TIMELINE_VALUES['x2'])
        .attr('y1', VAR_LG_TIMELINE_VALUES['y1'])
        .attr('y2', VAR_LG_TIMELINE_VALUES['y2'])
        .attr('stroke-width', Number(VAR_LG_TIMELINE_VALUES['stroke-width']))
        .attr('opacity',0);

    return times.merge(timesE);
}

function makeBarsSVG(barData, svg) {
    var selectBars = svg.selectAll('rect')
        .data(barData, function(d) {return d.id; });

    var selectBarsE = selectBars.enter().append('rect')
        .classed('selection', true)
        .attr('x', function (d) { return d.x;})
        .attr('y', function (d) { return d.y;})
        .attr('width', function (d){ return d.width; })
        .attr('height', function(d) { return d.height; })
        .attr('opacity', 0);

    return selectBars.merge(selectBarsE);
}