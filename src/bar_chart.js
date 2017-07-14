(function barChart() {

  d3.csv('https://raw.githubusercontent.com/Neon-Ape/PSMG-1-Tarantino/master/data/tarantino.csv', function(err, data) {

  var wordOrDeath = ["word","death"];
  var movies = ["Reservoir Dogs", "Pulp Fiction", "Jackie Brown", "Kill Bill: Vol. 1", "Kill Bill: Vol. 2", "Inglorious Basterds", "Django Unchained"];
  
  //"pivot" the data into deaths and words by movie
  var groups = {}
  var categories = {}; 

  var xkey = "type"
  var gkey = "movie" // what we group by
 
  // group all the events by type
  data.forEach(function(d) {
    if(!groups[d[gkey]]) {
      groups[d[gkey]] = [d];
    } else {
      groups[d[gkey]].push(d)
    }
  })
  var processed = [];
  //count how many incidents happended for each movie
  movies.forEach(function(movie,i) {
    var xdata = {};
    groups[movie].forEach(function(event) {
      if(!xdata[event[xkey]]) {
        xdata[event[xkey]] = 1
      } else {
        xdata[event[xkey]]++;
      }
    })

    // "result" is an ordered array with a count for each movie
     var result = {};
    wordOrDeath.forEach(function(g) {
        result[g]= xdata[g]||0;
    })
    processed.push(result)
  })
  var n = wordOrDeath.length, // number of layers
      m = processed.length, // number of samples per layer
      stack = d3.stack().keys(wordOrDeath);

  var layers = stack(processed); // calculate the stack layout

  layers.forEach(function(d,i) { //adding keys to every datapoint
        d.forEach(function(dd,j){
            dd.movie = movies[j];
            dd.type = wordOrDeath[i];
        })
    });  

var yGroupMax = d3.max(layers, function(layer) {
      return d3.max(layer, function(d) {
        return d[1] - d[0];
      });
    }),
    yStackMax = d3.max(layers, function(layer) {
      return d3.max(layer, function(d) {
        return d[1];
      });
    });
  var margin = {top: 40, right: 10, bottom: 50, left: 10},
      width = 1100 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scaleBand()
      .domain(movies)
      .rangeRound([0, width])
      .padding(0.5);

  var y = d3.scaleLinear()
      .domain([0, yStackMax])
      .range([height, 0]);
  var z = d3.scaleBand().domain(wordOrDeath).rangeRound([0, x.bandwidth()]);
  
  var color = d3.scaleOrdinal()
    .domain(['word', 'death'])
    .range(['#c09551', '#5f1020']);

  var svg = d3.select("#barChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(i); });

  var rect = layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { 
        
        return x(d.movie); })
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0);

  rect.transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) {
          return y(d[1]);
      })
      .attr("height", function(d) {
          return y(d[0]) - y(d[1]);
      });

  svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  var legend = svg.selectAll(".legend")
      .data(wordOrDeath)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d,i) { return color(i) });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });


  d3.selectAll("input").on("change", change);

  var timeout = setTimeout(function() {
    d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(timeout);
    if (this.value === "grouped") transitionGrouped();
    else transitionStacked();
  }

  function transitionGrouped() {
    y.domain([0, yGroupMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("x", function(d) {
                    return x(d.movie)+ z(d.type);
                })
                .attr("width", (x.bandwidth()) / 2)
                .transition()
                .attr("y", function(d) {
                    return y(d.data[d.type]);
                })
                .attr("height", function(d) {
                    return height - y(d.data[d.type]);
                });
  }

  function transitionStacked() {
    y.domain([0, yStackMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) {
          return y(d[1]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })
      .transition()
        .attr("x", function(d) { return x(d.movie); })
        .attr("width", x.bandwidth());
  }
});


}());