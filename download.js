// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require('./config.json'); /* Load the config.instances, and config.endpoints */
var fs = require('fs');
var https = require('https');
var beautify = require('js-beautify').js_beautify;
var mkdirp = require('mkdirp');
createSources();
function createSources() {

    var versions = require('./versions');
    console.log(JSON.stringify(versions, '', '  '))
    console.log('starting to create files');
  
    // check for directories...
    // ./sources/family/patch
    // ./docs/family/patch
    var sourceFolder = './sources/';
    for (var family in versions) {
        console.log("family: ", family);
      if (family !== 'undefined') {
        var familyFolder = sourceFolder + family + '/';
        for (var patch in versions[family]) {
          var patchFolder = familyFolder + patch + '/';
          console.log("patchfolder: ", patchFolder);
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
  
  function downloadEndpoints(obj) {
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
  