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

var VAR_TOOLTIP_WIDTH = 240;


// BUBBLECHART Variables

var VAR_BC_SVG_WIDTH = 1200;
var VAR_BC_SVG_HEIGHT = 800;
var VAR_BC_TOOLTIP_WIDTH = 240;
var VAR_BC_CENTER = { x: VAR_BC_SVG_WIDTH * 0.5, y: VAR_BC_SVG_HEIGHT *0.8/ 2 };
var VAR_BC_MOVIE_TITLE_X_LOOKUP = {
    "Reservoir Dogs" : VAR_BC_SVG_WIDTH*0.15,
    "Pulp Fiction" : VAR_BC_SVG_WIDTH*0.3,
    "Jackie Brown" : VAR_BC_SVG_WIDTH*0.45,
    "Kill Bill: Vol. 1" : VAR_BC_SVG_WIDTH*0.56,
    "Kill Bill: Vol. 2" : VAR_BC_SVG_WIDTH*0.66,
    "Inglorious Basterds" : VAR_BC_SVG_WIDTH*0.75,
    "Django Unchained" : VAR_BC_SVG_WIDTH*0.85
};
var VAR_BC_MOVIE_CENTER_LOOKUP = {
    "Reservoir Dogs" : { x: VAR_BC_SVG_WIDTH*0.2, y: VAR_BC_SVG_HEIGHT/2},
    "Pulp Fiction" : { x: VAR_BC_SVG_WIDTH*0.31, y: VAR_BC_SVG_HEIGHT/2},
    "Jackie Brown" : { x: VAR_BC_SVG_WIDTH*0.42, y: VAR_BC_SVG_HEIGHT/2},
    "Kill Bill: Vol. 1" : { x: VAR_BC_SVG_WIDTH*0.52, y: VAR_BC_SVG_HEIGHT/2},
    "Kill Bill: Vol. 2" : { x: VAR_BC_SVG_WIDTH*0.62, y: VAR_BC_SVG_HEIGHT/2},
    "Inglorious Basterds" : { x: VAR_BC_SVG_WIDTH*0.72, y: VAR_BC_SVG_HEIGHT/2},
    "Django Unchained" : { x: VAR_BC_SVG_WIDTH*0.80, y: VAR_BC_SVG_HEIGHT/2}
};
var VAR_BC_GROUP_CENTER_LOOKUP = {
    "ass" : {y: VAR_BC_SVG_HEIGHT*2/9},
    "shit" : {y: VAR_BC_SVG_HEIGHT*2.8/9},
    "fuck" : {y: VAR_BC_SVG_HEIGHT*3.7/9},
    "racial" : {y: VAR_BC_SVG_HEIGHT*4.7/9},
    "genital" : {y: VAR_BC_SVG_HEIGHT*5.4/9},
    "blasphemy" : {y: VAR_BC_SVG_HEIGHT*6.3/9},
    "other" : {y: VAR_BC_SVG_HEIGHT*7.1/9}
};
var VAR_BC_SIMU_FORCE_STRENGTH = 0.05;
var VAR_BC_SIMU_CHARGE_MULTIPLIER = 2.0;
var VAR_BC_SIMU_VELOCITY_DECAY = 0.15;
var VAR_BC_SIMU_SCALE_POW = {
    'exponent': 0.5,
    'range': {
        'low': 1,
        'high': 65
    }
};
var VAR_BC_X_RANDOM_MULTIPLIER = 900;
var VAR_BC_Y_RANDOM_MULTIPLIER = 800;

var VAR_BC_ANIMATION_DURATION = 2000;
var VAR_BC_SVG_BUBBLE_STROKE_WIDTH = 2;
var VAR_BC_SVG_MOVIE_TITLES_Y = 40;

// LINEGRAPH Variables

var VAR_LG_SVG_WIDTH = 1250;
var VAR_LG_SVG_HEIGHT = 350;
var VAR_LG_SVG_OFFSET_Y = 50;

var VAR_LG_DEFAULT_SEPARATOR = 20;
var VAR_LG_ANIMATION_DURATION = 800;

var VAR_LG_GRAPH_OFFSET_X = VAR_LG_SVG_WIDTH/40;
var VAR_LG_GRAPH_CUTOFF_X = VAR_LG_SVG_WIDTH*9/10;
var VAR_LG_GRAPH_WIDTH = VAR_LG_SVG_WIDTH*8.5/10;
var VAR_LG_GRAPH_HEIGHT = VAR_LG_SVG_HEIGHT - VAR_LG_SVG_OFFSET_Y;

var VAR_LG_AXIS_TEXT_OFFSET_X = 10;
var VAR_LG_AXIS_TEXT_OFFSET_Y = 5;
var VAR_LG_AXIS_HEIGHT = VAR_LG_GRAPH_HEIGHT - 20;

var VAR_LG_NODES_RADIUS = 1.5;
var VAR_LG_NODES_DEFAULT_Y = VAR_LG_SVG_HEIGHT + 20;

var VAR_LG_LINKS_STROKE_WIDTH = VAR_LG_NODES_RADIUS * 2 + 0.5;

var VAR_LG_BARS_Y = 10;
var VAR_LG_BARS_HEIGHT = VAR_LG_SVG_HEIGHT - VAR_LG_SVG_OFFSET_Y - 10;
var VAR_LG_BARS_LINE_HEIGHT = 10;
var VAR_LG_BARS_LINE_HEIGHT_BIG = 15;
var VAR_LG_BARS_LINE_WIDTH = 1;
var VAR_LG_BARS_TEXT_OFFSET_Y = VAR_LG_BARS_HEIGHT + 30;
var VAR_LG_BARS_TEXT_OFFSET_X = 5;
var VAR_LG_BARS_OPACITY = 0.3;
var VAR_LG_BARS_HOVER_OPACITY = 0.08;



// TIMELINE Variables

var VAR_LG_SVG2_WIDTH = 1200;
var VAR_LG_SVG2_HEIGHT = 285;

var VAR_LG_TIMELINE_VALUES = {
    'x1': 0,
    'x2': 0,
    'y1': 20,
    'y2': 60,
    'stroke-width': 2
};
var VAR_LC_TIMELINE_HEIGHT = 40;
var VAR_LG_TIMELINE_HOVER_OFFSET = 5;
var VAR_LG_TIMELINE_HOVER_WIDTH = 4;

var VAR_LG_TIMELINE_TEXT_OFFSET_X = 1050;

// SANKEY FLOW Variables
var VAR_SF_ASPECT = 1.75;
var VAR_SF_MARGIN_TOP = 10;
var VAR_SF_MARGIN_RIGHT = 92;
var VAR_SF_MARGIN_BOTTOM = 10;
var VAR_SF_MARGIN_LEFT = 150;
var VAR_SF_GRAPH_HEIGHT = 2000;
var VAR_SF_NODE_WIDTH = 25;
var VAR_SF_NODE_PADDING = 18;
var VAR_SF_DURATION = 500;

// set the dimensions and margins of the graph
var VAR_SF_MARGIN= {top: VAR_SF_MARGIN_TOP, right: VAR_SF_MARGIN_RIGHT, bottom: VAR_SF_MARGIN_BOTTOM, left: VAR_SF_MARGIN_LEFT};
var VAR_SF_HEIGHT = VAR_SF_GRAPH_HEIGHT - VAR_SF_MARGIN.top - VAR_SF_MARGIN.bottom;
var VAR_SF_WIDTH = (VAR_SF_HEIGHT + VAR_SF_MARGIN.top + VAR_SF_MARGIN.bottom) / VAR_SF_ASPECT - VAR_SF_MARGIN.left - VAR_SF_MARGIN.right;


// BARCHART Variables
var VAR_AXIS_POSITION_BARCHART = 40;
var VAR_MARGIN_BC = {top: 40, right: 10, bottom: 25, left: 10};
var VAR_WIDTH_BC = 1100 - VAR_MARGIN_BC.left - VAR_MARGIN_BC.right;
var VAR_HEIGHT_BC = 500 - VAR_MARGIN_BC.top - VAR_MARGIN_BC.bottom;

