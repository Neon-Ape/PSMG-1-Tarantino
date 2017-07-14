(function sankeyFloow(){

    var units = "Widgets";

// set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 10, left: 40},
        width = 700 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
// format variables
    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scaleOrdinal(d3.schemeCategory20);

// append the svg object to the body of the page
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(30)
        .nodePadding(17)
        .size([width, height]);

    var path = sankey.link();

    var div = d3.select("body").append("div")
        .attr("class", "tooltipsankey")
        .style("opacity", 0);

// load the data
    d3.json("./data/sankey.json", function(error, graph) {
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
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
        link.append("title")
            .text(function(d) {
                return d.source.name + " → " +
                    d.target.name + "\n" + format(d.value); });

// add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; });

// add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) {
                return d.color = color(d.name.replace(/ .*/, "")); })

            .append("title")
            .text(function(d) {
                return d.name + "\n" + format(d.value); });

// add in the title for the nodes
        node.append("text")
            .attr("x", 40)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x",  + sankey.nodeWidth())
            .attr("text-anchor", "start");

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
        })
            .on("mouseout", function(d) { svg.selectAll(".linksankey").transition()
                .duration(700)
                .style("opacity", 1)} );


// the function for moving the nodes
        function dragmove(d) {
            /**d3.select(this)
                .attr("transform",
                    "translate("
                    + d.x + ","
                    + (d.y = Math.max(
                            0, Math.min(height - d.dy, d3.event.y))
                    ) + ")"); */
            sankey.relayout();

        }
    });
}());