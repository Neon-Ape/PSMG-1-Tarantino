// Variables

var VAR_RESERVOIR_DOGS = "Reservoir Dogs";
var VAR_PULP_FICTION = "Pulp Fiction";
var VAR_JACKIE_BROWN = "Jackie Brown";
var VAR_KILL_BILL_1 = "Kill Bill: Vol. 1";
var VAR_KILL_BILL_2 = "Kill Bill: Vol. 2";
var VAR_INLGOURIOUS_BASTERDS = "Inglorious Basterds";
var VAR_DJANGO_UNCHAINED = "Django Unchained";

var VAR_MOVIE_CLASSES  = {
    "Reservoir Dogs" : 'dogs',
    "Pulp Fiction" : 'pulp',
    "Jackie Brown" : 'jackie',
    "Kill Bill: Vol. 1" : 'bill1',
    "Kill Bill: Vol. 2" : 'bill2',
    "Inglorious Basterds" : 'basterds',
    "Django Unchained" : 'django'
};

var VAR_GET_CLASS = function (movie) {
    return VAR_MOVIE_CLASSES[movie];
};


// LINEGRAPH Variables

var VAR_LG_SVG_WIDTH = 1200;
var VAR_LG_SVG_HEIGHT = 400;
var VAR_LG_SVG_OFFSET_Y = 100;

var VAR_LG_DEFAULT_SEPARATOR = 20;
var VAR_LG_ANIMATION_DURATION = 800;

var VAR_LG_GRAPH_OFFSET_X = VAR_LG_SVG_WIDTH/20;
var VAR_LG_GRAPH_CUTOFF_X = VAR_LG_SVG_WIDTH*9/10;
var VAR_LG_GRAPH_WIDTH = VAR_LG_SVG_WIDTH*8/10;
var VAR_LG_GRAPH_HEIGHT = VAR_LG_SVG_HEIGHT - VAR_LG_SVG_OFFSET_Y;

var VAR_LG_AXIS_TEXT_OFFSET_X = 10;
var VAR_LG_AXIS_TEXT_OFFSET_Y = 5;

var VAR_LG_NODES_RADIUS = 2;
var VAR_LG_NODES_DEFAULT_Y = VAR_LG_SVG_HEIGHT + 20;

var VAR_LG_BARS_Y = 10;
var VAR_LG_BARS_HEIGHT = VAR_LG_SVG_HEIGHT - VAR_LG_SVG_OFFSET_Y - 10;
var VAR_LG_BARS_OPACITY = 0.3;
var VAR_LG_BARS_HOVER_OPACITY = 0.08;



// TIMELINE Variables

var VAR_LG_SVG2_WIDTH = 1200;
var VAR_LG_SVG2_HEIGHT = 100;

var VAR_LG_TIMELINE_VALUES = {
    'x1': 0,
    'x2': 0,
    'y1': 20,
    'y2': 60,
    'stroke-width': 2
};
var VAR_LG_TIMELINE_HOVER_OFFSET = 5;
var VAR_LG_TIMELINE_HOVER_WIDTH = 4;