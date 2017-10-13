// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow
var config = require("./config"); /* Load the config.instances, and config.endpoints */
var fs = require("fs");
var https = require("https");
var beautify = require("js-beautify").js_beautify;
var mkdirp = require("mkdirp");
var wd = process.env.PWD;
var versions = {};
//console.log(JSON.stringify(config));
//config.instances.length = 3;
var counter = 0;
var instances = config.instances.map(function(url) {
  var body = "";
  https.get(url, data => {
    data.on("data", d => {
      body += d;
    });
    data.on("end", () => {
      addToVersions({
        body: body,
        url: url
      });
    });
  });
});

function addToVersions(obj) {
  try {
    var body = obj.body.toString();
    var url = obj.url;
    counter++;
    var family = body
      .split("<br/>Build name: ")[1]
      .split("<br/>")[0]
      .toLowerCase();
    var patch = body.split("__patch")[1].split("-")[0];
    var url = url.split("/stats.do")[0];
    if (
      versions &&
      versions[family] &&
      versions[family][patch] &&
      versions[family][patch] == "done"
    ) {
    } else {
      //console.log("missing stuff\nfamily:" + family + "\npatch:" + patch);
      if (versions && versions[family]) {
        //family exists...
        //console.log("family exists: " + family);
        if (versions[family] && versions[family][patch]) {
          //console.log("Found " + family + " patch " + patch + " @ " + url);
          versions[family][patch] = url;
        } else {
          versions[family][patch] = url;
        }
      } else {
        //console.log("creating family: " + family);
        // family doesn't exist, create it
        versions[family] = {};
        versions[family][patch] = url;
      }
    }
    if (counter == config.instances.length) {
      createSources();
    }
  } catch (err) {
    //console.log(err);
  }
}

function createSources() {
  console.log(JSON.stringify(versions, "", "  "));
  //check for directories...
  // ./sources/family/patch
  // ./docs/family/patch
  var sourceFolder = "./sources/";
  for (family in versions) {
    var familyFolder = sourceFolder + family + "/";
    for (patch in versions[family]) {
      var patchFolder = familyFolder + patch + "/";
      if (fs.existsSync(patchFolder) === false) {
        console.log("mkdir: " + patchFolder);
        mkdirp(patchFolder);
        downloadEndpoints({
          url: versions[family][patch],
          path: patchFolder
        });
      }
    }
  }
}

function downloadEndpoints(obj) {
  config.endpoints.map(function(file) {
    var justFile = file.split("/");
    justFile = justFile[justFile.length - 1];
    var url = obj.url + file;
    try {
      ////console.log(obj.url);
      if (obj.url) {
        https
          .get(url, data => {
            var body = "";
            data.on("data", d => {
              body += d;
            });
            data.on("end", () => {
              ////console.log('downloading ' + obj.url + file + ' to ' + obj.path + justFile);
              if (justFile.split(".")[1].toLowerCase() == "js") {
                //if .js file download it.
                //console.log(file);
                var subdir = file.split("/");
                subdir.length = subdir.length - 1;
                subdir = subdir.join("/");
                subdir = subdir.substring(1);
                var path = obj.path + subdir;
                //console.log("file: " + path);
                mkdirp(path);
                body = beautify(body, { indent_size: 2 });
                path.replace(/\//g,'//');
                fs.writeFile(path + justFile, body, function(err) {
                  if (err) {
                    //console.log(err.message);
                  }
                });
              } else {
                //else, get RESOURCES
                var regex = /(\/\*\! RESOURCE: )(.+)\*\//g;
                var found_resources = body.match(regex); //array of comments
                try {
                  if (typeof found_resources) {
                    found_resources.map(function(jsFile) {
                      jsFile = jsFile.split("/*! RESOURCE: ")[1].split("*/")[0];
                      if (
                        jsFile.indexOf(".jsx") == -1 &&
                        jsFile.indexOf("min.js") == -1 &&
                        jsFile.indexOf("_min_") == -1 &&
                        jsFile.indexOf(".js") >= 0
                      ) {
                        //if the file dose not include min.js in the name,
                        var url = obj.url + jsFile;
                        //console.log('downloading ' + jsFile + ' from ' + url);
                        https
                          .get(obj.url + jsFile, data => {
                            var jsBody = "";
                            data.on("data", d => {
                              jsBody += d;
                            });
                            data.on("end", () => {
                                //console.log(jsFile);
                              var justFile = jsFile.split("/");
                              justFile = justFile[justFile.length - 1].replace(
                                " ",
                                ""
                              );
                              //console.log('justFile: ' + justFile);
                              var jssubdir = jsFile.split("/");
                              jssubdir.length = jssubdir.length - 1;
                              jssubdir = jssubdir.join("/");
                              jssubdir = jssubdir.substring(1);
                              //jssubdir = jssubdir.replace(/\//g,'//');
                              var jspath = obj.path + jssubdir + '/';
                              mkdirp(jspath);
                              jspath = jspath + justFile;
                              //console.log('jspath: ' + jspath);
                              jsBody = beautify(jsBody, { indent_size: 2 });

                              fs.writeFile(
                                jspath + justFile,
                                jsBody,
                                function(err) {
                                  if (err) {
                                    //console.log(err.message);
                                  }
                                  ////console.log('downloaded ' + obj.path + justFile + ' from ' + url);
                                }
                              );
                            });
                          })
                          .on("error", e => {
                            ////console.error(e);
                          });
                      }
                    });
                  }
                } catch (error) {
                  ////console.log(error.message);
                }
              }
            });
          })
          .on("error", e => {
            ////console.error(e);
          });
      }
    } catch (err) {
      ////console.log(err);
    }
  });
}
