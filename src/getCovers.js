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

for(movie in coverLookup) {
    var img = "<img src='" + imageRoot + coverLookup[movie] + "'>";
    document.getElementById("covers").innerHTML += img;
}



