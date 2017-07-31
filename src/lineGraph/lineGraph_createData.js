// created node data out of raw data, returns array of Nodes
// the NodeFactory Class handles most of the heavy lifting
function createNodes(data, separator) {

    var width = VAR_LG_GRAPH_WIDTH;
    var offset = VAR_LG_GRAPH_OFFSET_X;

    var myNodes = new NodeFactory(width, offset, separator);

    for (var movie in data){
        if(data.hasOwnProperty(movie)) {
            var runtime = data[movie].runtime;
            myNodes.movie(movie, runtime);

            // push zero Node for structural reasons
            myNodes._step.set(-1);
            myNodes.push();

            /*
            collect words in each time slot
            if you exceed a time slot, push the collected words into a Node
            if there were no words, push anyway
             */
            for (var time in data[movie].children) {
                if(data[movie].children.hasOwnProperty(time)) {
                    while (time > myNodes.timeSlot()) {
                        myNodes.push();
                    }
                    myNodes.word(time, data[movie].children[time]);
                }
            }
            // if there are words left over in the collector push a Node.
            if (myNodes.collectorCount() !== 0) {
                myNodes.push();
            }

            // push a Node for every empty time slot at the end of the movie
            while (myNodes._step.get() < separator) {
                myNodes.push();
            }
        }
    }

    console.log(myNodes.getNodes());
    return myNodes.getNodes();
}

// connect all the nodes of every movie one by one
function createLinks(nodes) {
    function Link(source, target, movie) {
        this.movie = movie;
        this.source = source;
        this.target = target;
    }
    var myLinks = [];
    for (var i = 0; i < nodes.length - 1; i++) {
        if (nodes[i].movie === nodes[i+1].movie) {
            myLinks.push(new Link(nodes[i], nodes[i + 1], nodes[i].movie));
        }
    }
    console.log(myLinks);
    return myLinks;
}

// add a bar for every step of the graph
function createBars(separator) {
    function Bar(x,y,width,height,step) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.step = step;
    }
    var barWidth = VAR_LG_GRAPH_WIDTH/separator;
    var myBars = [];
    for (var i = 0; i < separator; i++) {
        myBars.push(new Bar(
            i*barWidth+VAR_LG_GRAPH_OFFSET_X,
            VAR_LG_BARS_Y,
            barWidth,
            VAR_LG_BARS_HEIGHT,
            i
        ));
    }

    console.log(myBars);
    return myBars;
}

// Calculates the maximum scale value
function calculateScaleStep(nodeData) {
    var maxValue = d3.max(nodeData, function (d) {
        return d.count;
    });
    return Math.ceil(maxValue / 10);
}

// Create y-Axis Scale Data
function createScale(scaleStep, scaleMax) {
    // Object for lines and text
    function Step(step, scaleStep) {
        this.x1 = 0;
        this.y1 = VAR_LG_GRAPH_HEIGHT - step * scaleStep;
        this.x2 = VAR_LG_GRAPH_CUTOFF_X;
        this.y2 = VAR_LG_GRAPH_HEIGHT - step * scaleStep;
        this.text = step * 10;
    }
    // Generate axis data
    var scaleData = [];
    for (var i = 0; i <= scaleMax; i++) {
        scaleData.push(new Step(i, scaleStep))
    }
    return scaleData;
}



