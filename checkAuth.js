// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require('./config.json') /* Load the config.instances, and config.endpoints */
var request = require('request')
var fs = require('fs')
var https = require('https')
var mkdirp = require('mkdirp')
config.instances = config.instances.sort()
config.instances.map(function (instance) {
  config.users.map(function (user){
    var url = '';
    if (instance.indexOf('.') >= 0) {
      url = 'https://' + instance;
    } else {
      url = 'https://' + instance + '.service-now.com'
    }
    var requestOptions = {
      url: url + '/api/now/table/sys_user?sysparm_query=user_name%3Dadmin&sysparm_fields=user_name&sysparm_limit=1',
      method: 'GET',
      //body: config.payload,
      timeout: 30000,
      auth: {
        //user: 'admin',
        user: user.name,
        pass: user.pass
      }
    };
    request(requestOptions, function (error, response, body) {// eslint-disable-line 
      // console.log(response.body)
      if (error) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
          //console.log("Could not connect in " + requestOptions.timeout / 1000 + " seconds to " + url)
        } else {
          console.log(requestOptions.url);
          console.error(error);
        }
      } else { // no error
        if(response.statusCode === 200){
          console.log(url + '/login.do?user_name=' + user.name + '&user_password=' + user.pass + '&sys_action=sysverb_login');
        }
        //console.log(response.statusCode + ' ' + requestOptions.url + ' ' + ' ... ' + response.body);
      }
    })
  })
})
