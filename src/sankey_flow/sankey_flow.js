/**
 * Code from Clau Dermont: https://bl.ocks.org/cdermont/846051eb548e846eac60
 *
 * Where not otherwise covered by separate copyright or license:
 * [![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
 * This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
 *
 * The code of Clau Dermont uses d3 v3. In this code were updates made to v4 used from the following code example: https://bl.ocks.org/d3noob/013054e8d7807dff76247b81b0e29030
 */

function sankeyFlow() {

    var tooltip = floatingTooltip("gates_tooltip", VAR_TOOLTIP_WIDTH);

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(VAR_SF_NODE_WIDTH) // sets the size of the rect
        .nodePadding(VAR_SF_NODE_PADDING) // distance from the rects underneath each other
        .size([VAR_SF_WIDTH, VAR_SF_HEIGHT]);

    var path = sankey.link();

    // defines the color of the nodes and the links for each movie and the curse words
    var fillColor = d3.scaleOrdinal()
        .domain(["Reservoir Dogs", "Pulp Fiction", "Jackie Brown", "Kill Bill: Vol. 1", "Kill Bill: Vol. 2", "Inglorious Basterds", "Django Unchained", "other"])
        .range(["#ff3f8c", "#322d8e", "#050505", "#ffda05", "#ad0101", "#203020","#490000", "#cea794"]);

    // load the data
    var chart = function chart(selector, graph) {
        // append the svg object to the body of the page
        var svg = d3.select(selector).append("svg")
            .attr("width", VAR_SF_WIDTH + VAR_SF_MARGIN.left + VAR_SF_MARGIN.right)
            .attr("height", VAR_SF_HEIGHT / 2 + VAR_SF_MARGIN.top + VAR_SF_MARGIN.bottom)
            .append("g")
            .attr("transform",
                "translate(" + VAR_SF_MARGIN.left + "," + VAR_SF_MARGIN.top + ")");

        var div = d3.select(selector).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr("id", function(d) {
                return "link" + d.source.name;
            })
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy / 2);
            })
            .style("stroke", function(d) {
                return fillColor(d.source.name);
            })
            //show tooltip on link
            .on("mouseover", showLinkDetail)
            .on("mouseout", hideDetail);

        // add the link titles
        link.append("title");

        // add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y  / 2 + ")";
            });

        // add the rectangles for the nodes
        var rect = node.append("rect")
            .attr("height", function(d) {
                return d.dy / 2 + 4;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d){
                return fillColor(d.type);
            });

        // add in the title for the nodes
        var text = node.append("text")
            .attr("x", 45)
            .attr("y", function(d) { return d.dy / 4; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < VAR_SF_WIDTH / 2; })
            .attr("x", -55 + sankey.nodeWidth())
            .attr("text-anchor", "end")
            .style("font-size", "14px");

        node.selectAll("text").style("letter-spacing", "0.8px");

        // Fade-Effect on mouseover
        node.on("mouseover", function(d) {
            link.transition()
                .duration(VAR_SF_DURATION)
                .style("opacity", 0.1);

            link.filter(function(s) { return d.name === s.source.name; }).transition()
                .duration(VAR_SF_DURATION)
                .style("opacity", 1);
            link.filter(function(t) { return d.name === t.target.name; }).transition()
                .duration(VAR_SF_DURATION)
                .style("opacity", 1);
            showNodeDetail(d);
        });
        node.on("mouseout", function() { svg.selectAll(".link").transition()
                .duration(VAR_SF_DURATION)
                .style("opacity", 1);
                hideDetail();
                });

        // Function called on mouseover to display node details in a tooltip
        function showNodeDetail(d) {
            var content = '<span class="name">Word occurrences: </span><span class="value">' +
                d.value +
                '</span><br/>' + '<span class="name">Name: </span><span class="value">' +
                d.name +
                '</span><br/>';
            tooltip.showTooltip(content, d3.event);
        }

        // Function called on mouseover to display link details in a tooltip
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
