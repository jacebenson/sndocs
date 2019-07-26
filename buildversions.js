// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require('./config.json'); /* Load the config.instances, and config.endpoints */
//var data = require('./data.json');//load the good data... for new records.
var request = require('request');
var fs = require('fs');
var https = require('https');
var versions = require('./versions');
var counter = 0;

var l = 0;
config.instances = config.instances.sort();
config.instances.map(function (instance, index) {

  var url = '';
  if (instance.indexOf('.') >= 0) {
    url = 'https://' + instance;
  } else {
    url = 'https://' + instance + '.service-now.com';
  }
  var requestOptions = {
    url: url + '/InstanceInfo.do?SOAP',
    method: 'POST',
    body: config.payload,
    timeout: 60000,
    rejectUnauthorized: false, // added to get around ssl issue found.
    headers: {
      Authorization: 'Basic ' + new Buffer("admin" + ":" + "admin").toString('base64')
    }
  };
  request(requestOptions, function (error, response, body) {// eslint-disable-line 
    l++;
    //console.log('Requesting: ' + url);
    // console.log(response.body);
    if (error) {
      if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        console.log('Could not connect in ' + requestOptions.timeout / 1000 + ' seconds to ' + url);
      } else {
        console.log(requestOptions.url)
        console.error(error);
      }
    } else { // no error

      console.log('-----------------------------', l, '/', config.instances.length, '-----------------------------');
      console.log('Instance: ', url);
      var buildTagArr = response.body.toString().split('<build_tag>');
      if (buildTagArr.length > 1) {
        var buildTag = buildTagArr[1].split('</')[0];
        if (instance.indexOf('.') >= 0) {
          url = 'https://' + instance;
        } else {
          url = 'https://' + instance + '.service-now.com';
        }
        console.log('BuildTag:  ' + buildTag);
        addToVersions({
          url: url,
          buildTag: buildTag
        });
      } else {
        console.log(instance + ' does not have a build tag');
      }
    }
    if (l === config.instances.length) {
      //console.log('writing to versions....', versions)
      fs.writeFileSync('./versions.json', JSON.stringify(versions, '', '  '), function (err) {
        if (err) {
          return console.log(err);
        }
      });
    }
  });

});

/**
 * This function adds to the ./versions.json
 * @param {JS} obj - Obj used to give all requirements to fx
 * obj.buildTag - glide-helsinki-03-16-2016__patch12a-08-25-2017
 * obj.url - https://example.service-now.com
 */
function addToVersions(obj) {
  try {
    //console.log(obj.buildTag + ': ' + obj.url);
    var url = obj.url;
    counter++;
    if (obj.buildTag) {
      var family = obj.buildTag.split('glide-')[1].split('-')[0];
    } else {
      // var family = 'Unknown';//do nothing!
    }
    var patch = 0;
    if (obj.buildTag.indexOf('patch') >= 0) {
      patch = obj.buildTag.split('patch')[1].split('-')[0];
    }
    if (
      versions &&
      versions[family] &&
      versions[family][patch] &&
      versions[family][patch] === 'done'
    ) {
    } else {
      //console.log('Family: ' + family + '  Patch:' + patch);
      if (versions && versions[family]) {
        // family exists...
        // console.log('family exists: ' + family);
        if (versions[family] && versions[family][patch]) {
          // console.log('Found ' + family + ' patch ' + patch + ' @ ' + url)
          versions[family][patch] = url;
        } else {
          versions[family][patch] = url;
        }
      } else {
        // console.log('creating family: ' + family + ' for ' + url);
        // family doesn't exist, create it
        versions[family] = {};
        if (typeof patch === 'undefined') {
          patch = 0;
        }
        versions[family][patch] = url;
      }
    }
  } catch (err) {
    console.log(err);
  }
}