var config = require('./config.json'); /* Load the config.instances, and config.endpoints */
var request = require('request');
var xpath = require('xpath');
var DOM = require('xmldom').DOMParser;
var property = 'glide.sys.default.tz';
config.instances = config.instances.sort();
// config.instances.length = 5;
config.instances.map(function (instance) {
    var url = '';
    if (instance.indexOf('.') >= 0) {
      url = 'https://' + instance;
    } else {
      url = 'https://' + instance + '.service-now.com';
    }
    var propertyPayload = '';
    propertyPayload += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:get="http://www.service-now.com/GetProperty">';
    propertyPayload += '  <soapenv:Header/>';
    propertyPayload += '  <soapenv:Body>';
    propertyPayload += '     <get:execute>';
    propertyPayload += '        <!--Optional:-->';
    propertyPayload += '        <property>' + property + '</property>';
    propertyPayload += '     </get:execute>';
    propertyPayload += '  </soapenv:Body>';
    propertyPayload += '</soapenv:Envelope>';

    var requestOptions = {
      url: url + '/GetProperty.do?SOAP',
      method: 'POST',
      body: propertyPayload,
      timeout: 30000
    };

    request(requestOptions, function (error, response, body) {// eslint-disable-line 
      if (error) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
          console.log('Could not connect in ' + requestOptions.timeout / 1000 + ' seconds to ' + url);
        } else {
          console.log(requestOptions.url);
          // console.error(error);
        }
      } else { // no error
        if (response.statusCode === 200) {
          console.log('Requesting: ' + url + ' ' + response.statusCode);

          // console.log(response.statusCode);
          // console.log(response.body);
          var doc = new DOM().parseFromString(response.body);
          // console.log(doc);
          var prop = xpath.select('string(//*[local-name() = "property"])', doc);
          console.log(property + ':   ' + prop);
        } else {
          console.log(requestOptions.url, response.statusCode);
        }
      }
    });
});
