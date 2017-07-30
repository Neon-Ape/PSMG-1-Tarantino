/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */


var myBubbleChart = bubbleChart();
var myLineGraph = lineGraph();
var mySankeyFlow = sankeyFlow();
var myRanking = liquidGauge();
var wordTiming = null;
var movieRanking = null;

function runtimeLookup(data) {
    var runtimes = {};
    for (var i = 0; i < data.length; i++) {
        runtimes[data[i]["movie"]] = Number(data[i]["runtime"]);
    }
    return runtimes;
}

function makeTiming(data, extraData) {

    var runTimes = runtimeLookup(extraData);

    function MovieBlock(runtime) {
        this.runtime = runtime;
        this.children = {};
    }

    var timeLine = {};

    movieBlockActive = "";

    for (var i = 0; i < data.length; i++) {
        var currentType = data[i]["type"];
        var currentWord = data[i]["word"];
        var currentTime = data[i]["minutes_in"];
        var currentMovie = data[i]["movie"];

        if (currentMovie !== movieBlockActive) {
            movieBlockActive = currentMovie;
            var runtime = runTimes[movieBlockActive];
            timeLine[currentMovie] = new MovieBlock(runtime);
        }

        if (currentType === "word") {
            timeLine[movieBlockActive].children[currentTime] = currentWord;
        }
    }
    console.log(timeLine);
    return timeLine;
}

function makeCurseWords(data, movieDates) {

    var curseWords = {
        children: []
    };

    var wordCheck = [];

    for (var i = 0; i < data.length; i++) {
        var currentWord = data[i]["word"];
        var currentMovie = data[i]["movie"];

        if (currentWord === "") {
            // do nothing
        } else {
            curseWords = checkForDuplicates(curseWords, movieDates, wordCheck, currentWord, currentMovie);
        }
    }

    return curseWords;
}

function curseGroups(word) {
    var curseCategories = {
        // word related
        "fuck": "fuck",
        "ass": "ass",
        "shit": "shit",
        "merde": "shit",
        // racial slurs
        "n-word": "racial",
        "negro": "racial",
        "jap": "racial",
        "gook": "racial",
        "jew": "racial",
        // genital related
        "dick": "genital",
        "cocksucker": "genital",
        "pussy": "genital",
        "cunt": "genital",
        // blasphemy
        "god": "blasphemy",
        "damn": "blasphemy",
        "hell": "blasphemy"
    };

    var group;
    for (group in curseCategories) {
        if (word.includes(group)) {
            return curseCategories[group];
        }
    }
    return "other";

}

function checkForDuplicates(curseWords, movieDates, wordCheck, currentWord, currentMovie) {

    function CurseWord(word, count, movie, year, group) {
        this.name = word;
        this.value = count;
        this.movie = movie;
        this.year = year;
        this.group = group;
    }


    var start = 0;
    while (true) {
        var index = wordCheck.indexOf(currentWord, start);

        if (index !== -1) {
            if (curseWords.children[index].movie !== currentMovie) {
                start = index + 1;
            } else {
                curseWords.children[index].value++;
                break;
            }
        } else {
            var group = curseGroups(currentWord);
            curseWords.children.push(new CurseWord(currentWord, 1, currentMovie, movieDates[currentMovie], group));
            wordCheck.push(currentWord);
            break;
        }
    }

    return curseWords;
}

function makeSankey(curseWords) {

    function SankeyNode(index, name, type) {
        this.name = name;
        this.node = index;
        this.type = type;
    }


    function SankeyLink(source, target, value) {
        this.source = source;
        this.target = target;
        this.value = value;
    }

    //var categories = ["fuck", "ass", "shit", "racial", "genital", "blashemy", "other"];

    var sankey420 = {
        nodes: [],
        links: []
    };

    var i = 0;

    //categories.forEach(pushNode(d));

    var movieLookup = {
        value: [],
        index: [],
        getIndex: function (d) {
            return this.index[this.value.indexOf(d)];
        }
    };

    var wordLookup = {
        value: [],
        index: [],
        getIndex: function (d) {
            return this.index[this.value.indexOf(d)];
        }
    };

    for (var word in curseWords.children) {

        word = curseWords.children[word];
//        if (word.movie != "Pulp Fiction" && word.movie != "Jackie Brown" && word.movie != "Reservoir Dogs" && word.movie != "Django Unchained") {

        if (-1 === movieLookup.value.indexOf(word.movie)) {
            movieLookup.value.push(word.movie);
            movieLookup.index.push(i);
            sankey420.nodes.push(new SankeyNode(i, word.movie, word.movie));
            i++;
        }
        if (-1 === wordLookup.value.indexOf(word.name)) {
            wordLookup.value.push(word.name);
            wordLookup.index.push(i);
            sankey420.nodes.push(new SankeyNode(i, word.name, "other"));
            i++;
        }

        var source = movieLookup.getIndex(word.movie);
        var target = wordLookup.getIndex(word.name);
        sankey420.links.push(new SankeyLink(source, target, word.value));

    }
    console.log("sankey:");
    console.log(sankey420);
    console.log("sankey done");
    return sankey420;
}

function getExtraData(data) {
    var movieDates = [];

    for (var i = 0; i < data.length; i++) {
        movieDates[data[i]["movie"]] = data[i]["year"];
    }

    return movieDates;
}

function getMovieRankings(data){
    var ratings = {
        imdb: [],
        tomatoes: []
        //metacritic: []
    };

    var Movie = function (movie, rating) {
        this.movie = movie;
        this.rating = rating;
    };

    for (var i = 0; i <  data.length; i++) {
        ratings.imdb[i] = new Movie(data[i]["movie"],data[i]["imdb"]);
        ratings.tomatoes[i] = new Movie(data[i]["movie"],data[i]["rotten_tomatoes"]);
        //ratings.metacritic[i] = new Movie(data[i]["movie"], data[i]["metacritic"]);

    }
    console.log("movieRanking: " + movieRanking);
    return ratings;
}

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function addExtraInfo(error, data) {
    if (error) {
        console.log(error);
    }
    var extrasUrl = "https://raw.githubusercontent.com/Neon-Ape/PSMG-1-Tarantino/master/data/tarantino_extra.csv";
    d3.csv(extrasUrl, function (error2, extraData) {
        if (error2) {
            console.log(error2);
        }
        var movieDates = getExtraData(extraData);
        wordTiming = makeTiming(data, extraData);
        var curseWords = makeCurseWords(data, movieDates);
        var sankeyFlow = makeSankey(curseWords);
        movieRanking = getMovieRankings(extraData);

        myBubbleChart('#bubbleChart', curseWords);
        myLineGraph('#lineGraph', '#timeline', wordTiming, 20);
        mySankeyFlow('#sankeyFlow', sankeyFlow);



    });

}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
    d3.select('#toolbar')
        .selectAll('.button')
        .on('click', function () {
            // Remove active class from all buttons
            d3.select('#toolbar').selectAll('.button').classed('active', false);
            // Find the button just clicked
            var button = d3.select(this);

            // Set it as the active button
            button.classed('active', true);

            // Get the id of the button
            var buttonId = button.attr('id');

            // Toggle the bubble chart based on
            // the currently clicked button.
            myBubbleChart.toggleDisplay(buttonId);
        });

    d3.select('#graphSelect')
        .selectAll('.cover')
        .on('click', function () {

            // Find the button just clicked
            var button = d3.select(this).select('.button');

            // Toggle the active state
            if (button.classed('active')) {
                button.classed('active', false);
            } else {
                button.classed('active', true);
            }

            // Get the id of the button
            var buttonId = button.attr('id');

            // Toggle the bubble chart based on
            // the currently clicked button.
            myLineGraph.toggleDisplay(buttonId);
        });

    d3.select('#separatorSelect')
        .selectAll('.button')
        .on('click', function () {
            if (!d3.select(this).classed('active')) {
                // Remove active class from all buttons
                d3.select('#separatorSelect').selectAll('.button').classed('active', false);
                // Find the button just clicked
                var button = d3.select(this);

                // Set it as the active button
                button.classed('active', true);

                // Get the id of the button
                var buttonId = button.attr('id');

                myLineGraph.remove();

                myLineGraph('#lineGraph', '#timeline', wordTiming, buttonId);
            }
        });

    d3.select('#imdb')
        .on('click', function() {
            myRanking("imdb",movieRanking.imdb);
            myRanking("tomatoes",movieRanking.tomatoes);
            //myRanking("metacritic",movieRanking.metacritic);
        });

}

// Load the data.
d3.csv('https://raw.githubusercontent.com/Neon-Ape/PSMG-1-Tarantino/master/data/tarantino.csv', addExtraInfo);

// setup the buttons.
setupButtons();
