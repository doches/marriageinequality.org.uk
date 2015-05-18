var sys = require('sys'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    mysql = require('mysql');

var soc_codes = require('./soc_codes.json');
var cities = require('./cities.json');
var countries = require('./countries.json');

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

function fetchStory(response, attempts) {
  var id = [Number.parseInt(Math.random()*max_id)];
  var query = pool.query('SELECT * from salaries where id = ?', id, function(err, result) {
      try {
          var obj = result[0];
          var cities_in_region = cities[obj.region.replace(" ","_")];
          if (!cities_in_region) {
            cities_in_region = cities["west_midlands"];
          }
          obj.city = cities_in_region[Math.floor(Math.random()*cities_in_region.length)];
          var jobs = soc_codes[obj.soc];
          if (jobs) {
              obj.job = jobs[Math.floor(Math.random()*jobs.length)];
          }
          obj.other_country = countries[Math.floor(Math.random()*countries.length)];

          response.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
          });
          response.end(JSON.stringify(obj));
      } catch(e) {
          if (attempts > 10) {
              response.writeHead(400, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
              });
              response.end(JSON.stringify(e));
          } else {
            fetchStory(response, attempts + 1);
          }
      }
  });
}

http.createServer(function (request, response) {
    fetchStory(response, 1);
}).listen(port, hostname);
console.log("Server running at http://"+hostname+":" + port+ "/");
