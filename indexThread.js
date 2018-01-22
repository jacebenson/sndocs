
const spawn = require('threads').spawn;

const thread = spawn(function (a) {
		// Remember that this function will be run in another execution context.
		//console.log(process.cwd());
		//var config = require('./config') /* Load the config.instances, and config.endpoints */
			var request = require('request')
			var xpath = require('xpath')
			var DOM = require('xmldom').DOMParser
			var fs = require('fs')
			var https = require('https')
			var beautify = require('js-beautify').js_beautify
			var mkdirp = require('mkdirp')
			var versions = {
			"eureka" : {},
			"fuji" : {},
			"geneva" : {},
			"helsinki" : {},
			"istanbul" : {},
			"jakarta" : {},
			"kingston" : {}
		}
		
		function sendPost(url) {
			var url = 'https://' + url + '.service-now.com'
				request({
					url : url + '/InstanceInfo.do?SOAP',
					method : 'POST',
					body : config.payload
				}, function (error, response, body) { // eslint-disable-line
					// console.log(url)
					// console.log(response.body)
					if (error) {
						console.error(error);
					} else {
						console.log(url);
						var doc = new DOM().parseFromString(response.body);
						var buildTag = xpath.select('string(//*[local-name() = "build_tag"])', doc)
							console.log('BUILDTAG: ' + buildTag);
						//addToVersions({
							//url : 'https://' + url + '.service-now.com/',
							//buildTag : buildTag
						//})
					}
				})
		}

		sendPost(a);
  return;

	});

thread
.send('aarons')
// The handlers come here: (none of them is mandatory)
.on('message', function (response) {
	console.log('a');
	thread.kill();
});
