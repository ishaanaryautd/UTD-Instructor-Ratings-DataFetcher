var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var google = require('google');
var app = express();
var fs = require('fs')


app.get('/getData', function(req, res1, next) {     // Getting the data from the chrome extension

	var nextCounter = 0;
	var googleSearch = req.query.google_search;
	googleSearch = JSON.parse(googleSearch);
	var i = req.query.i;
	var links = [];
	console.log(i);

	var URL = googleSearch;
	console.log(URL);

	request(URL, function(error, response, body) {

		if(error) { return  console.error('There was an error!'); }

		var $ = cheerio.load(body);
		var htmas = $("div.not-found-box").next().html();
		if(htmas.includes('Your search')) // If the professor is not found return ERROR
		{
			console.log("ERROR")
			var data ={difficult : "unknown", overallQuality : "unknown", i:i}
			data = JSON.stringify(data);
			console.log(data);
			res1.json(data);
		}

		$('a').each(function() {
		var text = $(this).text();
		var link = $(this).attr('href');

			if(link && link.match(/ShowRatings/)){              
			
				link = url+link; // If link found on the search page matches the ShowRatings attribute which is typical for professor rating page urls
				links.push( link ); // Creating an array of links which match the showRatings criterion
				console.log(links);
				
				if(links.length != 2)  // Checking if there are not multiple professor's for the same name
				{
					request(links[0], function (error, response, body) {
						if (!error) {
							
							var $ = cheerio.load(body);

							if(($("[class='breakdown-section difficulty'] .grade").html()))
							{
								difficulty = ($("[class='breakdown-section difficulty'] .grade").html()).replace(/\s+/g, ""); // Extracting difficulty
							}
							else{difficulty = 'null'} // Otherwise null
							if(($("[class='breakdown-section difficulty'] .grade").html()) )
							{
								overallQuality = $("[class='breakdown-container quality'] .grade").html().replace(/\s+/g, ""); // Extracting Quality
							}
							else{overallQuality = 'null'}
							console.log( difficulty + ".");
							console.log(overallQuality + ".");
							var data = {difficult : difficulty, quality : overallQuality, i : i }; // Forming the data to be sent
							data = JSON.stringify(data);
							res1.json(data);
							console.log(data);
						}
						else {
							  console.log("Sorry we messed up somewhere: " + error);
						}
					});
				}
			}
		});
	});
});

//setting port to listen on
app.set('port', (process.env.PORT || 5000));
//Start server
app.listen(app.get('port'),function(){
  console.log('Node app is running on port', app.get('port'));
});
