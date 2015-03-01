var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var async = require('async');
var exec = require('child_process').exec;

var query = 'http://www.dcard.tw/api/forum/sex/3/';
var postq = 'http://www.dcard.tw/api/post/all/'
// var page = 1;


async.times(190, function(n, next){


	request.get('http://www.dcard.tw/api/forum/sex/'+(n+1)+'/', function(err, httpResponse, body){
		var pics = [];
		ids = _.pluck(JSON.parse(body), 'id');
		async.each(ids, function(eachid, callback){
			request.get(postq + eachid, function(err, httpResponse, body){
				if(body){
					var doc = JSON.parse(body)
					var vlen = doc.version.length;
					var vlast = doc.version[vlen - 1]

					if(vlast.title.match(/圖/)){
						var re = /(http:\/\/.+)\n/g
						var findp = vlast.content.match(re)
						_.each(findp, function(p){
							//delete \n
							p = p.substring(0, p.length - 1);

							//check imgur
							if(p.match(/imgur/)){
								//get imgur id
								var imgurid = p.match(/imgur\.com\/([A-Za-z0-9]+)/)[1]
								p = 'http://i.imgur.com/'+ imgurid +'.jpg'

							}

							pics.push(p)
						})	
					}	
				}
				
				
				


				callback();
			})
		}, function(err){
			// console.log(pics)
			console.log('第 '+(n+1)+ '頁: '+pics.length+' 張')
			_.each(pics, function(pic){
				// console.log(pic)
				
				exec('cd image && curl -O '+pic)
			})
		})
		
	})	

})
