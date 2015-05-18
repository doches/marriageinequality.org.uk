var sys = require('sys'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    mysql = require('mysql');

var soc_codes = require('./soc_codes.json');
var cities = require('./cities.json');

var max_id = 3097;
var port = 3097;
var hostname = "localhost";

var pool = mysql.createPool({
    connectionLimit: 12,
    host: 'localhost',
    user: 'torywedding',
    password: 'theresamay',
    database: 'torywedding'
});

http.createServer(function (request, response) {
    var id = [Number.parseInt(Math.random()*max_id)];
    var query = pool.query('SELECT * from salaries where id = ?', id, function(err, result) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        var obj = result[0];
        var cities_in_region = cities[obj.region.replace(" ","_")];
        if (cities_in_region) {
            obj.city = cities_in_region[Math.floor(Math.random()*cities_in_region.length)];
        }
        var jobs = soc_codes[obj.soc];
        if (jobs) {
            obj.job = jobs[Math.floor(Math.random()*jobs.length)];
        }
        response.end(JSON.stringify(obj));
    });
}).listen(port, hostname);
console.log("Server running at http://"+hostname+":" + port+ "/");
