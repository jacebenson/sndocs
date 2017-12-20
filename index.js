// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require('./config') /* Load the config.instances, and config.endpoints */
var request = require('request')
var xpath = require('xpath')
var DOM = require('xmldom').DOMParser
var fs = require('fs')
var https = require('https')
var beautify = require('js-beautify').js_beautify
var mkdirp = require('mkdirp')
// var wd = process.env.PWD
var versions = {}
// config.instances.length = 3;
var counter = 0
// config.instances = ['hi', 'csus']
// var xmlStr = "<?xml version='1.0' encoding='UTF-8'?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><SOAP-ENV:Body><executeResponse xmlns="http://www.service-now.com/InstanceInfo"><result><install_name>Demo Server</install_name><instance_name>csus</instance_name><instance_id>08ede02a4a36232b002a52c083a0a228</instance_id><build_date>09-12-2017_1404</build_date><build_tag>glide-helsinki-03-16-2016__patch12a-08-25-2017</build_tag><system_id>app128152.iad106.service-now.com:csus025</system_id><node_id>8af278dcc593c8df4e4a10f7fc40941a</node_id><instance_ip>10.59.128.152</instance_ip><mid_buildstamp>helsinki-03-16-2016__patch12a-08-25-2017_09-12-2017_1404</mid_buildstamp><mid_version>09-12-2017_1404</mid_version></result></executeResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>";
// var doc = new dom.parseFromString(xmlStr);
config.instances = config.instances.sort()
config.instances.map(function (instance) {
  var url = 'https://' + instance + '.service-now.com'
  request({
    url: url + '/InstanceInfo.do?SOAP',
    method: 'POST',
    body: config.payload
  }, function (error, response, body) {
    // console.log(url)
    // console.log(response.body)
    var doc = new DOM().parseFromString(response.body)
    var buildTag = xpath.select('string(//*[local-name() = "build_tag"])', doc)
    // console.log(instance + ' BUILDTAG: ' + buildTag)
    addToVersions({
      url: 'https://' + instance + '.service-now.com/',
      buildTag: buildTag
    })
  }
)
})

function addToVersions (obj) {
  try {
    // console.log('trying ' + obj.url + ' -- ' + obj.buildTag)
    var url = obj.url
    counter++
    var family = obj.buildTag.split('glide-')[1].split('-')[0]
    var patch = 0
    if (obj.buildTag.indexOf('patch') >= 0) {
      patch = obj.buildTag.split('patch')[1].split('-')[0]
    }
    if (
      versions &&
      versions[family] &&
      versions[family][patch] &&
      versions[family][patch] === 'done'
    ) {
    } else {
      // console.log("missing stuff\nfamily:" + family + "\npatch:" + patch);
      if (versions && versions[family]) {
        // family exists...
        // console.log("family exists: " + family);
        if (versions[family] && versions[family][patch]) {
          console.log('Found ' + family + ' patch ' + patch + ' @ ' + url)
          versions[family][patch] = url
        } else {
          versions[family][patch] = url
        }
      } else {
        console.log('creating family: ' + family + ' for ' + url)
        // family doesn't exist, create it
        versions[family] = {}
        if (typeof patch === 'undefined') {
          patch = 0
        }
        versions[family][patch] = url
      }
    }
    if (counter === config.instances.length) {
      createSources()
    }
  } catch (err) {
    console.log(err)
  }
}

function createSources () {
  console.log(JSON.stringify(versions, '', '  '))
  // check for directories...
  // ./sources/family/patch
  // ./docs/family/patch
  var sourceFolder = './sources/'
  for (var family in versions) {
    if (family !== 'undefined') {
      var familyFolder = sourceFolder + family + '/'
      for (var patch in versions[family]) {
        var patchFolder = familyFolder + patch + '/'
        if (fs.existsSync(patchFolder) === false) {
          console.log('mkdir: ' + patchFolder)
          mkdirp(patchFolder)
          downloadEndpoints({
            url: versions[family][patch],
            path: patchFolder
          })
        }
      }
    }
  }
}

function downloadEndpoints (obj) {
  config.endpoints.map(function (file) {
    var justFile = file.split('/')
    justFile = justFile[justFile.length - 1]
    var url = obj.url + file
    try {
      /// /console.log(obj.url);
      if (obj.url) {
        https
          .get(url, data => {
            var body = ''
            data.on('data', d => {
              body += d
            })
            data.on('end', () => {
              console.log(
                'downloading ' + obj.url + file + ' to ' + obj.path + justFile
              )
              if (justFile.split('.')[1].toLowerCase() === 'js') {
                // if .js file download it.
                // console.log(file);
                var subdir = file.split('/')
                subdir.length = subdir.length - 1
                subdir = subdir.join('/')
                subdir = subdir.substring(1)
                var path = obj.path + subdir
                // console.log("file: " + path);
                mkdirp(path)
                body = beautify(body, { indent_size: 2 })
                path.replace(/\//g, '//')
                fs.writeFile(path + justFile, body, function (err) {
                  if (err) {
                    // console.log(err.message);
                  }
                })
              } else {
                // else, get RESOURCES
                var regex = /(\/\*! RESOURCE: )(.+)\*\//g
                var foundResources = body.match(regex) // array of comments
                try {
                  if (typeof foundResources === 'object') {
                    foundResources.map(function (jsFile) {
                      jsFile = jsFile.split('/*! RESOURCE: ')[1].split('*/')[0]
                      if (
                        jsFile.indexOf('.jsx') === -1 &&
                        jsFile.indexOf('min.js') === -1 &&
                        jsFile.indexOf('_min_') === -1 &&
                        jsFile.indexOf('.js') >= 0
                      ) {
                        // if the file dose not include min.js in the name,
                        var url = obj.url + jsFile
                        console.log('downloading ' + jsFile + ' from ' + url)
                        https
                          .get(obj.url + jsFile, data => {
                            var jsBody = ''
                            data.on('data', d => {
                              jsBody += d
                            })
                            data.on('end', () => {
                              console.log(jsFile)
                              var justFile = jsFile.split('/')
                              justFile = justFile[justFile.length - 1].replace(
                                ' ',
                                ''
                              )
                              // console.log('justFile: ' + justFile);
                              var jssubdir = jsFile.split('/')
                              jssubdir.length = jssubdir.length - 1
                              jssubdir = jssubdir.join('/')
                              jssubdir = jssubdir.substring(1)
                              // jssubdir = jssubdir.replace(/\//g,'//');
                              var jspath = obj.path + jssubdir + '/'
                              mkdirp(jspath)
                              jspath = jspath + justFile
                              // console.log('jspath: ' + jspath);
                              jsBody = beautify(jsBody, { indent_size: 2 })

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
                                )
                              })
                            })
                          })
                          .on('error', e => {
                            /// /console.error(e);
                          })
                      }
                    })
                  }
                } catch (error) {
                  /// /console.log(error.message);
                }
              }
            })
          })
          .on('error', e => {
            /// /console.error(e);
          })
      }
    } catch (err) {
      /// /console.log(err);
    }
  })
}
