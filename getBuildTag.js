module.exports = function(input, done) {
  var fs = require('fs')
  var https = require('https')
  var request = require('request')
  var xpath = require('xpath')
  var DOM = require('xmldom').DOMParser
  var argv = require('yargs').argv
  var xmlPayload = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ins='http://www.service-now.com/InstanceInfo'>\n<soapenv:Header/>\n\t<soapenv:Body>\n\t\t<ins:execute/>\n\t</soapenv:Body>\n</soapenv:Envelope>";
  if(argv.url){
      var url = "https://" + argv.url + ".service-now.com";
      request(
        {
          url: url + "/InstanceInfo.do?SOAP",
          method: "POST",
          body: xmlPayload
        },
        function(error, response, body) {
          if (error) {
            console.error(error);
          } else {
            console.log(url);
            var doc = new DOM().parseFromString(response.body);
            var buildTag = xpath.select(
              'string(//*[local-name() = "build_tag"])',
              doc
            );
            console.log("BUILDTAG: " + buildTag);
          }
        }
      );
      done(url + ': ' + buildTag);
  } else {
      console.log('Missing URL');
  }
};
