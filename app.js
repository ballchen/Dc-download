var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var async = require('async');
var exec = require('child_process').exec;
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var fs = require('fs');
var path = require('path');
var events = require('events');
var redis = require("redis");
var client = redis.createClient();


var query = 'http://www.dcard.tw/api/forum/sex/3/';
var postq = 'http://www.dcard.tw/api/post/all/';
var searchapi = 'https://www.dcard.tw/api/search?search=%E5%9C%96&size=20&forum_alias=sex';
// var page = 1;
// 

var engine = new events.EventEmitter();

var getPostID = function(from) {
	request.get(searchapi + '&from=' + from, {
		json: true
	}, function(err, res, body) {
		if (body.length) {
			ids = _.pluck(body, 'id');
			client.sadd('postids', ids);
			getPostID(from + 20);
		}
	});
};

var getPostImgur = function() {
	client.spop('postids', function(err, id) {
		if (id) {
			request.get(postq + id, {
				json: true
			}, function(err, res, body) {
				if (res.statusCode != 404) {
					var match = body.version[0].content.match(/https?:\/\/i?\.?imgur.com\/([A-Za-z0-9]+)/g);
					if (match && match.length) {
						match.forEach(function(pic) {
							var newpic = "http://i.imgur.com/" + pic.match(/https?:\/\/i?\.?imgur.com\/([A-Za-z0-9]+)/)[1] + '.jpg';
							engine.emit('imgur', {
								gender: body.member.gender,
								pic: newpic
							});
						});
					}
				}
			});
		} else {
			engine.emit('nothing');
		}


	});
};



getPostID(0);
getPostImgur();

engine.on('imgur', function(data) {
	console.log(data.gender, data.pic);
	client.sadd('imgur', JSON.stringify(data));
	getPostImgur();
});

engine.on('nothing', function() {
	getPostImgur();
});