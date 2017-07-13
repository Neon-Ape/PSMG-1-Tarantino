(function sankeyFloow(){

var units = "Stimmen";

var aspect = 0.8;

var margin = {top: 5, right: 40, bottom: 5, left: 40},
    height = 800 - margin.top - margin.bottom,
    width = (height+margin.top+margin.bottom)/aspect - margin.left - margin.right;
	
var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category20();

var svg = d3.select("#sankeyFlow").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.attr("class", "svgchart")
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(17)
    .size([width, height]);

var path = sankey.link();

var div = d3.select("body").append("div")   
    .attr("class", "tooltipsankey")               
    .style("opacity", 0);	

var color = d3.scale.ordinal()
    .domain(["Reservoir Dogs", "Pulp Fiction", "Kill Bill: Vol. 1", "fucked", "fucking", "fuck", "motherfucker", "fucker", "fucks", "fuckup", "dick", "dicks",  "shit", "fucking", "bullshit"])
    .range(["yellowgreen", "firebrick", "blue", "grey", "grey", "grey","grey", "grey", "grey", "grey", "grey", "grey", "grey", "grey", "grey"]);

var rect
var node
var link
	
d3.csv("./data/sankeygr2015.csv", function(error, data) {
daten = data
  graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
      graph.nodes.push({ "name": d.source });
      graph.nodes.push({ "name": d.target });
      graph.links.push({ "source": d.source,
                         "target": d.target,
						 "color": d.color,
                         "value": +d.value });
     });

     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { return d.name; })
       .map(graph.nodes));

     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "linksankey")
      .attr("d", path)
	  .attr("id", function(d) { return "link" + d.source.name; })
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	  .style("stroke", function(d) { return d.color; });

  link.on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html("<b>" + d.source.name + "</b> → <b>"  + d.target.name + "</b><br/>" + format(d.value))  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
				
node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "nodesankey")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });
	
rect = node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return color(d.name); });

rect.on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html("<b>" + d.name + "</b>:<br/>" + format(d.value))  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
	  
  node.append("text")
      .attr("x", 40)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .attr("transform", null)
      .text(function(d) { return d.name; })
	  .attr("class", "graph")
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", -40 + sankey.nodeWidth())
      .attr("text-anchor", "end");
  
// Fade-Effect on mouseover
node.on("mouseover", function(d) {
	link.transition()        
        .duration(700)
		.style("opacity", .1);
	link.filter(function(s) { return d.name == s.source.name; }).transition()        
        .duration(700)
		.style("opacity", 1);
	link.filter(function(t) { return d.name == t.target.name; }).transition()        
        .duration(700)
		.style("opacity", 1);
	})
	.on("mouseout", function(d) { svg.selectAll(".linksankey").transition()        
        .duration(700)
		.style("opacity", 1)} ); 
 	  	  
});

}());