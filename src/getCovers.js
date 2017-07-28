var imageRoot = "https://raw.githubusercontent.com/Neon-Ape/PSMG-1-Tarantino/master/data/images/";

var coverLookup = {
    "Reservoir Dogs" : "Reservoir Dogs.jpg",
    "Pulp Fiction" : "Pulp Fiction.jpg",
    "Jackie Brown" : "Jackie Brown.jpg",
    "Kill Bill: Vol. 1" : "Kill Bill Vol. 1.jpg",
    "Kill Bill: Vol. 2" : "Kill Bill Vol. 2.jpg",
    "Inglorious Basterds" : "Inglourious Basterds.jpg",
    "Django Unchained" : "Django Unchained.jpg"

};

var i = 1;
for(movie in coverLookup) {
    var img = "<img src='" + imageRoot + coverLookup[movie] + "'>";
    var elem = document.getElementById("box"+i);
    var elems = document.getElementById("img"+i);
    elem.insertAdjacentHTML('afterbegin', img);
    elems.insertAdjacentHTML('afterbegin', img);
    document.getElementById("bcCovers").innerHTML += img;
    i++;
}