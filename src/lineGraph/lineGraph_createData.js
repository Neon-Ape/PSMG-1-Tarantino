/*
 * This data manipulation function takes the raw data from
 * the CSV file and converts it into an array of node objects.
 * Each node will store data and visualization values to visualize
 * a bubble.
 *
 * rawData is expected to be an array of data objects, read in from
 * one of d3's loading functions like d3.csv.
 *
 * This function returns the new node array, with a node in that
 * array for each element in the rawData input.
 */

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
            while (myNodes.timeSlot() <= runtime) {
                myNodes.push();
            }
        }
    }

    console.log(myNodes.getNodes());
    return myNodes.getNodes();
}

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
    for (var i = 0; i <= separator; i++) {
        myBars.push(new Bar((i)*barWidth+VAR_LG_GRAPH_OFFSET_X,VAR_LG_BARS_Y,barWidth, VAR_LG_BARS_HEIGHT, i));

    }

    console.log(myBars);
    return myBars;
}



