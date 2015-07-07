var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var events = require('events');
var redis = require("redis");
var client = redis.createClient();

// var engine = new events.EventEmitter();

var downloadImgur = function() {
	client.spop('imgur', function(err, image) {
		if (image) {
			var i = JSON.parse(image);
			request
				.get(i.pic)
				.on('error', function(err) {
					console.log(err);
				})
				.on('end', function(err) {
					console.log(path.basename(i.pic) + " complete.");
				})
				.pipe(fs.createWriteStream("image" + (i.gender === 'M' ? "gay" : "girl") + "/" + path.basename(i.pic)));

		}
	});
};


setInterval(downloadImgur, 200);