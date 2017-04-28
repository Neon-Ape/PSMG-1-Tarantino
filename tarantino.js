// based on: https://bost.ocks.org/mike/bar/

var d3 = d3 || {};
var clickable = true;

function doChart() {
    "use strict";
    if(clickable) {

        function curseWord(word, count) {
            this.word = word;
            this.count = count;
        }

        var wordCheck = [];

        var curseWords = {
                words : []
        }

        
        d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/tarantino/tarantino.csv", function(data) {
            console.log(data[0]["word"]);
            
            for (var i = 0; i <  50; i++) {
                var currentWord = data[i]["word"];
                if (currentWord == " "){

                } else {
                    var index = wordCheck.indexOf(currentWord)
                    console.log(currentWord + " - " + i + ", index: " + index);
                    if(index != -1) {
                        curseWords.words[index].count++;
                    } else {
                        curseWords.words.push(new curseWord(currentWord, 1));
                        wordCheck.push(currentWord);
                    }
                }

            }

            console.log(curseWords.words.length);
            console.log(curseWords.words);




            // select myChart, data is columns, append <g> for each 
            var svgContainer = d3.select("svg");

            var groups = svgContainer.selectAll("g")
                                     .data(curseWords.words)
                                     .enter()
                                     .append("g");

            var i = 0;
            groups.append("circle")
                    .attr("r", function(d) {
                        return d.count;
                   })
                   .attr("cx", function() {
                    i++;
                    return i*100
                   })
                   .attr("cy", function() {

                    return 50;
                   })
                   
                   .style("fill", function() {
                    // fill = "rgb(rand(0,255),rand(0,255),rand(0,255))"
                     return "rgb(" + Math.floor((Math.random() *  255) + 1) + "," + Math.floor((Math.random() *  255) + 1) + "," + Math.floor((Math.random() *  255) + 1) + ")"
                   });

            var y=0;
            groups.append("text")
                .attr("y", 50)
                .attr("x", function() {
                    y++;
                    return (40+(y*100))
                   })
                .style("fill", "#000")
                .text(function(d) { return d.word});
                
        });   
        clickable = false;
    }
}

// Für 2.2
function createBubbleData() {
    "use strict";
        var svg = d3.select("svg"),
        diameter = +svg.attr("width"),
        format = d3.format(",d");

        function curseWord(word, count) {
            this.name = word;
            this.value = count;
        }

        var wordCheck = [];

        var curseWords = {
                children : []
        }

        d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/tarantino/tarantino.csv", function(error, data) {
            if (error) throw error;

            //console.log(data[0]["word"]);
            
            for (var i = 0; i <  data.length; i++) {
                var currentWord = data[i]["word"];
                if (currentWord == ""){

                } else {
                    var index = wordCheck.indexOf(currentWord)
                    //console.log(currentWord + " - " + i + ", index: " + index);
                    if(index != -1) {
                        curseWords.children[index].value++;
                    } else {
                        curseWords.children.push(new curseWord(currentWord, 1));
                        wordCheck.push(currentWord);
                    }
                }

            }

            //console.log(curseWords.children.length);
            //console.log(curseWords.children);

            var pack = d3.pack()
                        .size([diameter - 4, diameter - 4]);

            var hierarchy = d3.hierarchy(curseWords)
                  .sum(function(d) { return d.value; })
                  .sort(function(a, b) { return b.value - a.value; });

            var bubbleData = pack(hierarchy);

            var groups = svg.selectAll("g")
                                     .data(bubbleData.descendants())
                                     .enter()
                                     .append("g");
                                     
            groups.append("circle")
                    .attr("r", function(d) {
                        return d.r
                   })
                   .attr("cx", function(d) {
                        return d.x
                   })
                   .attr("cy", function(d) {
                        return d.y
                   })
                   .style("fill", function() {
                    // fill = "rgb(rand(0,255),rand(0,255),rand(0,255))"
                     return "rgb(" + Math.floor((Math.random() *  255) + 1) + "," + Math.floor((Math.random() *  255) + 1) + "," + Math.floor((Math.random() *  255) + 1) + ")"
                   });

            groups.append("text")
                .attr("y", function(d) {
                    return d.y
                })
                .attr("x", function(d) {
                    return d.x
                   })
                .style("fill", "#000")
                .text(function(d) {return d.data.name + ": " + d.data.value});
        });
}