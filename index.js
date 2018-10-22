// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require('./config.json'); /* Load the config.instances, and config.endpoints */
var request = require('request');
var xpath = require('xpath');
var DOM = require('xmldom').DOMParser;
var fs = require('fs');
var https = require('https');
var beautify = require('js-beautify').js_beautify;
var mkdirp = require('mkdirp');
var versions = require('./versions');
var counter = 0;
config.instances = config.instances.sort();
config.instances.map(function (instance) {
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
    timeout: 30000,
    rejectUnauthorized: false // added to get around ssl issue found.
  };
  request(requestOptions, function (error, response, body) {// eslint-disable-line 
    console.log('Requesting: ' + url);
    // console.log(response.body);
    if (error) {
      if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
        console.log('Could not connect in ' + requestOptions.timeout / 1000 + ' seconds to ' + url);
      } else {
        console.log(requestOptions.url);
        console.error(error);
      }
    } else { // no error
      var doc = new DOM().parseFromString(response.body);
      var buildTag = xpath.select('string(//*[local-name() = "build_tag"])', doc);
      if (instance.indexOf('.') >= 0) {
        url = 'https://' + instance;
      } else {
        url = 'https://' + instance + '.service-now.com';
      }
      console.log('BuildTag:   ' + buildTag);
      console.log('-------------------------' + (counter + 1) + '/' + config.instances.length + '--------------------------');
      addToVersions({
        url: url,
        buildTag: buildTag
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
function addToVersions (obj) {
  try {
    console.log(obj.buildTag + ': ' + obj.url);
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
      // console.log('missing stuff\nfamily:' + family + '\npatch:' + patch);
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
        console.log('creating family: ' + family + ' for ' + url);
        // family doesn't exist, create it
        versions[family] = {};
        if (typeof patch === 'undefined') {
          patch = 0;
        }
        versions[family][patch] = url;
      }
    }
    if (counter === config.instances.length) {
      createSources();
    }
  } catch (err) {
    console.log(err);
  }
}

function createSources () {
  // console.log(JSON.stringify(versions, '', '  '))
  console.log('starting to create files');
  fs.writeFile('./versions.json', JSON.stringify(versions, '', '  '), function (err) {
    if (err) {
      return console.log(err);
    }
  });
  // check for directories...
  // ./sources/family/patch
  // ./docs/family/patch
  var sourceFolder = './sources/';
  for (var family in versions) {
    if (family !== 'undefined') {
      var familyFolder = sourceFolder + family + '/';
      for (var patch in versions[family]) {
        var patchFolder = familyFolder + patch + '/';
        if (fs.existsSync(patchFolder) === false) {
          console.log('mkdir: ' + patchFolder);
          mkdirp(patchFolder);
          downloadEndpoints({
            url: versions[family][patch],
            path: patchFolder
          });
        }
      }
    }
  }
}

function downloadEndpoints (obj) {
  config.endpoints.map(function (file) {
    var justFile = file.split('/');
    justFile = justFile[justFile.length - 1];
    var url = obj.url + file;
    try {
      /// /console.log(obj.url);
      if (obj.url) {
        https
          .get(url, data => {
            var body = '';
            data.on('data', d => {
              body += d;
            });
            data.on('end', () => {
              if (justFile.split('.')[1].toLowerCase() === 'js') {
                // if .js file download it.
                // console.log(file);
                var subdir = file.split('/');
                subdir.length = subdir.length - 1;
                subdir = subdir.join('/');
                subdir = subdir.substring(1);
                var path = obj.path + subdir;
                // console.log('file: ' + path);
                mkdirp(path);
                body = beautify(body, { indent_size: 2 });
                path = path.replace(/\//g, '//') + '//';
                console.log(
                  'downloading ' + obj.url + file + ' to ' + path + justFile
                );
                fs.writeFile(path + justFile, body, function (err) {
                  if (err) {
                    // console.log(err.message);
                  }
                });
              } else {
                // else, get RESOURCES
                var regex = /(\/\*! RESOURCE: )(.+)\*\//g;
                var foundResources = body.match(regex); // array of comments
                try {
                  if (typeof foundResources === 'object') {
                    foundResources.map(function (jsFile) {
                      jsFile = jsFile.split('/*! RESOURCE: ')[1].split('*/')[0];
                      if (
                        jsFile.indexOf('.jsx') === -1 &&
                        jsFile.indexOf('min.js') === -1 &&
                        jsFile.indexOf('_min_') === -1 &&
                        jsFile.indexOf('.js') >= 0
                      ) {
                        // if the file dose not include min.js in the name,
                        var url = obj.url + jsFile;
                        console.log('downloading ' + jsFile + ' from ' + url);
                        https
                          .get(obj.url + jsFile, data => {
                            var jsBody = '';
                            data.on('data', d => {
                              jsBody += d;
                            });
                            data.on('end', () => {
                              console.log(jsFile);
                              var justFile = jsFile.split('/');
                              justFile = justFile[justFile.length - 1].replace(
                                ' ',
                                ''
                              );
                              // console.log('justFile: ' + justFile);
                              var jssubdir = jsFile.split('/');
                              jssubdir.length = jssubdir.length - 1;
                              jssubdir = jssubdir.join('/');
                              jssubdir = jssubdir.substring(1);
                              // jssubdir = jssubdir.replace(/\//g,'//');
                              var jspath = obj.path + jssubdir + '/';
                              mkdirp(jspath);
                              jspath = jspath + justFile;
                              // console.log('jspath: ' + jspath);
                              jsBody = beautify(jsBody, { indent_size: 2 });

                              fs.writeFile(jspath, jsBody, function (err) {
                                if (err) {
                                  // console.log(err.message);
                                }
                                console.log(
                                  'downloaded ' +
                                  obj.path +
                                  justFile +
                                  ' from ' +
                                  url
                                );
                              });
                            });
                          })
                          .on('error', e => {
                            /// /console.error(e);
                          });
                      }
                    });
                  }
                } catch (error) {
                  /// /console.log(error.message);
                }
              }
            });
          })
          .on('error', e => {
            /// /console.error(e);
          });
      }
    } catch (err) {
      /// /console.log(err);
    }
  });
}
