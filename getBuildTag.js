//module.exports = function(input, done) {
  var fs = require('fs')
  var https = require('https')
  var request = require('request')
  var argv = require('yargs').argv
  //console.log(argv);
  if(argv.url){
      //console.log(argv);
      var url = "https://" + argv.url + ".service-now.com";
      request(
        {
          url: url + "/stats.do",
          method: "GET"
        },
        function(error, response, body) {
          if (error) {
            console.error(error);
          } else {
            console.log(url);
            var parts = response.body.split('Build tag: ')[1];
            parts = parts.split('<br')[0];
            var buildTag = parts;
            console.log("BUILDTAG: " + buildTag);
          }
        }
      );
     // done(url + ': ' + buildTag);
  } else {
      console.log('Missing URL');
  }
//};
