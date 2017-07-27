/** http://bl.ocks.org/mashehu/de923d763a53d523596ba81c6d1f3233

 Copyright 2016, mashehu (github-name)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function barChart() {

  d3.csv('https://raw.githubusercontent.com/Neon-Ape/PSMG-1-Tarantino/master/data/tarantino.csv', function(err, data) {

  var wordOrDeath = ["word","death"];
  var movies = ["Reservoir Dogs", "Pulp Fiction", "Jackie Brown", "Kill Bill: Vol. 1", "Kill Bill: Vol. 2", "Inglorious Basterds", "Django Unchained"];

  //"pivot" the data into deaths and words by movie
  var groups = {};
  var categories = {};
  var saveResult = {};

  var xkey = "type";
  var gkey = "movie"; // what we group by

  var tooltip = floatingTooltip('gates_tooltip', 240);
  var tooltipData = [];

  // group all the events by type
  data.forEach(function(d) {
    if(!groups[d[gkey]]) {
      groups[d[gkey]] = [d];
    } else {
      groups[d[gkey]].push(d)
    }
  });
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
    });


    // "result" is an ordered array with a count for each movie
     var result = [];
    wordOrDeath.forEach(function(g) {
        result[g]= xdata[g]||0;
        saveResult[g] = result[g];
    });
    processed.push(result)
  });

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

  var x = d3.scaleBand()
      .domain(movies)
      .rangeRound([0, WIDTH_BC])
      .padding(0.5);

  var y = d3.scaleLinear()
      .domain([0, yStackMax])
      .range([HEIGHT_BC, 0]);
  var z = d3.scaleBand().domain(wordOrDeath).rangeRound([0, x.bandwidth()]);

  var color = d3.scaleOrdinal()
    .domain(['word', 'death'])
    .range(['#c09551', '#5f1020']);

  var svg = d3.select("#barChart").append("svg")
      .attr("width", WIDTH_BC + MARGIN_BC.left + MARGIN_BC.right)
      .attr("height", HEIGHT_BC + MARGIN_BC.top + MARGIN_BC.bottom)
    .append("g")
      .attr("transform", "translate(" + MARGIN_BC.left + "," + MARGIN_BC.top + ")");

  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(i); });

  var rect = layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) {

        return x(d.movie)+ AXIS_POSITION_BARCHART; })
      .attr("y", HEIGHT_BC)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

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
      .attr("transform", "translate("+ AXIS_POSITION_BARCHART+"," + HEIGHT_BC + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
      .attr("class", "yaxis")
      .attr("transform", "translate("+AXIS_POSITION_BARCHART+",0)")
      .call(d3.axisLeft(y).tickSizeOuter(0));

  var legend = svg.selectAll(".legend")
      .data(wordOrDeath)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 35 + ")"; });

  legend.append("rect")
      .attr("x", WIDTH_BC - 18)
      .attr("width", 25)
      .attr("height", 25)
      .style("fill", function(d,i) { return color(i) });


  legend.append("text")
      .attr("x", WIDTH_BC - 24)
      .attr("y", 13)
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
                    return x(d.movie)+AXIS_POSITION_BARCHART+ z(d.type);
                })
                .attr("width", (x.bandwidth()) / 2)
                .transition()
                .attr("y", function(d) {
                    return y(d.data[d.type]);
                })
                .attr("height", function(d) {
                    return HEIGHT_BC - y(d.data[d.type]);
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
        .attr("x", function(d) { return x(d.movie)+AXIS_POSITION_BARCHART; })
        .attr("width", x.bandwidth());
  }

  // Function called on mouseover to display tooltip
  function showDetail(d) {
      var content = '<span class="name">Ocurrences: </span><span class="value">' + d.data[d.type];
      tooltip.showTooltip(content, d3.event);
  }

  /* hides tooltip */
  function hideDetail() {
      tooltip.hideTooltip();
  }

});


}());