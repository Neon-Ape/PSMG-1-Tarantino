/**https://bl.ocks.org/cdermont/846051eb548e846eac60

Where not otherwise covered by separate copyright or license:

[![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
*/

function sankeyFlow(){

    var units = "Words";
    var aspect = 1.75;

    var tooltip = floatingTooltip('gates_tooltip', 240);

// set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 10, left: 135},
        height = 2000 - margin.top - margin.bottom,
        width = (height+margin.top+margin.bottom)/aspect - margin.left - margin.right;
// format variables
    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(30) // sets the size of the rect
        .nodePadding(17) // distance from the rects underneath each other (before value 17)
        .size([width, height]);

    var path = sankey.link();

    var fillColor = d3.scaleOrdinal()
        .domain(['Reservoir Dogs', 'Pulp Fiction', 'Jackie Brown', 'Kill Bill: Vol. 1', 'Kill Bill: Vol. 2', 'Inglorious Basterds', 'Django Unchained', 'other'])
        .range(['#ff3f8c', '#3c4e94', '#000', '#ffda05','#ea1f18','#417d00','#730000', '#222']);

    // load the data
    var chart = function(selector, graph) {
        console.log("we are in sankey function");
        console.log(graph);

        // append the svg object to the body of the page
        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height/2 + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select(selector).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        console.log(graph.links);
// add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr("id", function(d) { return "link" + d.source.name; })
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy / 2);
            })
            .style("stroke", function(d) {
                return fillColor(d.source.name);
            })
            //show tooltip on link
            .on('mouseover', showLinkDetail)
            .on('mouseout', hideDetail);


// add the link titles
        link.append("title");



// add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y  / 2+ ")"; });

// add the rectangles for the nodes
        var rect = node.append("rect")
            .attr("height", function(d) { return d.dy / 2 + 1; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d){return fillColor(d.type)});

// add in the title for the nodes
        node.append("text")
            .attr("x", 45)
            .attr("y", function(d) { return d.dy / 4; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", -55 + sankey.nodeWidth())
            .attr("text-anchor", "end");

        // Fade-Effect on mouseover
        node.on("mouseover", function(d) {
            link.transition()
                .duration(700)
                .style("opacity", .1);

            link.filter(function(s) { return d.name === s.source.name; }).transition()
                .duration(700)
                .style("opacity", 1);
            link.filter(function(t) { return d.name === t.target.name; }).transition()
                .duration(700)
                .style("opacity", 1);
            showDetail(d);
        });
        node.on("mouseout", function(d) { svg.selectAll(".link").transition()
                .duration(700)
                .style("opacity", 1);
                hideDetail();
                });




        // Function called on mouseover to display details in a tooltip
        function showDetail(d) {
            var content = '<span class="name">Word occurrences: </span><span class="value">' +
                d.value +
                '</span><br/>';
            tooltip.showTooltip(content, d3.event);
        }

        function showLinkDetail(d) {
            var content = '<span class="name">Movie: </span><span class="value">' + d.source.name + '</span><br/>' +
            '<span class="name">Word: </span><span class="value">' + d.target.name + '</span><br/>' +
            '<span class="name">Word occurrences: </span><span class="value">' + d.value + '</span><br/>';
            tooltip.showTooltip(content, d3.event);
        }

        // Hides tooltip
        function hideDetail() {
            tooltip.hideTooltip();
        }
    };
    return chart;
}
