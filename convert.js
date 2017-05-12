/**
 * Converter
 */

 /*
var filepath = 'data-xperium';

var fs = require('fs');
fs.readdir(filepath, function(err, files) {
	
	var users = {};
	files.forEach(function(filename) {
		if (filename.split('.').pop() != 'json') {
			return;
		}
		
		var content = fs.readFileSync(filepath + '/' + filename, {encoding: 'utf-8'});
		JSON.parse(content).forEach(function(value) {
			var userId = value['header']['userId'];

			if(!(userId in users)) {
				users[userId] = [];
			}
			users[userId].push({
				header: {
						//scriptVersion: value['header']['scriptVersion'],
						date: filename.substring(0, 10)
				}, 
				data: value['body']//value['data']
			});
		});
	});
	
	// Write user files
	fs.mkdir(filepath + '/convert/', function(err) {
		if(err) {
			// directory already exists
		}
		
		for(user in users) {
			var data = JSON.stringify(users[user], null, 2);
			fs.writeFile(filepath + '/convert/' + user + '.json', data, function(err) {
				if(err) {
					console.log('error writing');
				}
			});
		}
	});
	
	
	console.log('All data are loaded!');
});
*/