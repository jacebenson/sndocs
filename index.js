// SNDocs
// ======
// SNDocs is the unofficial documentation for Servicenow 
var config = require("./config"); /* Load the config.instances, and config.endpoints */
var fs = require("fs");
var https = require("https");
var beautify = require('js-beautify').js_beautify;
var wd = process.env.PWD;
var versions = {
    "helsinki": {},
    "istanbul": {},
    "jakarta": {}

    /**
     * family: {
     *      patch: 0
     *      url: 
     * }
     */
};
//console.log(JSON.stringify(config));
//config.instances.length = 3;
var counter = 0;
var instances = config.instances.map(function(url) {
    var body = '';
    https.get(url, (data) => {
        data.on('data', (d) => {
            body += d;
        });
        data.on('end', () => {
            addToVersions({
                body: body,
                url: url
            });
        });
    });
});

function addToVersions(obj) {
    var body = obj.body.toString();
    var url = obj.url;
    counter++;
    var family = body.split('<br/>Build name: ')[1].split('<br/>')[0].toLowerCase();
    var patch = body.split('__patch')[1].split('-')[0];
    var url = url.split('/stats.do')[0];
    var familyExists = typeof versions[family];
    if (familyExists) {
        var patchExists = typeof versions[family][patch];
        if (patchExists) {
            versions[family][patch] = url;
        } else {
            versions[family][patch] = url;
        }
    } else { // family doesn't exist, create it
        versions[family] = {};
        versions[family][patch] = url;
    }
    if (counter == config.instances.length) {
        createSources();
    }

}

function makeFolder(path, callback) {
    if (!fs.existsSync(path)) {
        fs.mkdir(path, function(err) {
            if (err) {
                return console.error(err);
            }
        });
        makeFolder(path, callback);
    }
    callback();
};

function createSources() {
    console.log(JSON.stringify(versions, '', '  '));
    //check for directories...
    // ./sources/family/patch
    // ./docs/family/patch
    var sourceFolder = './sources/';
    makeFolder(sourceFolder, function() {
        for (family in versions) {
            var familyFolder = sourceFolder + family + '/';
            makeFolder(familyFolder, function() {
                for (patch in versions[family]) {
                    var patchFolder = familyFolder + patch + '/';
                    makeFolder(patchFolder, function() {
                        downloadEndpoints({
                            "url": versions[family][patch],
                            "path": patchFolder
                        });
                    });
                }
            });
        }
    });
}

function downloadEndpoints(obj) {
    config.endpoints.map(function(file) {
        var justFile = file.split('/');
        justFile = justFile[justFile.length - 1];
        var url = obj.url + file;
        https.get(url, (data) => {
            var body = '';
            data.on('data', (d) => {
                body += d;
            });
            data.on('end', () => {
                //console.log('downloading ' + obj.url + file + ' to ' + obj.path + justFile);
                if (justFile.split('.')[1].toLowerCase() == 'js') {
                    //if .js file download it.
                    body = beautify(body, { indent_size: 2 }); 
                    fs.writeFile(obj.path + justFile, body, function(err) {
                        if (err) {
                            console.log(err.message);
                        }
                    });
                } else { //else, get RESOURCES
                    var regex = /(\/\*\! RESOURCE: )(.+)\*\//g;
                    var found_resources = body.match(regex); //array of comments
                    try {
                        if (typeof found_resources) {
                            found_resources.map(function(jsFile) {
                                jsFile = jsFile.split('/*! RESOURCE: ')[1].split('*/')[0];
                                if (jsFile.indexOf('.jsx') == -1 && jsFile.indexOf('min.js') == -1 && jsFile.indexOf('_min_') == -1 && jsFile.indexOf('.js') >= 0) {
                                    //if the file dose not include min.js in the name,
                                    var url = obj.url + jsFile
                                    console.log('downloading ' + jsFile + ' from ' + url);
                                    https.get(obj.url + jsFile, (data) => {
                                        var jsBody = '';
                                        data.on('data', (d) => {
                                            jsBody += d;
                                        });
                                        data.on('end', () => {
                                            var justFile = jsFile.split('/');
                                            justFile = justFile[justFile.length - 1].replace(' ','');
                                            jsBody = beautify(jsBody, { indent_size: 2 });
                                            fs.writeFile(obj.path + justFile, jsBody, function(err) {
                                                if (err) {
                                                    console.log(err.message);
                                                }
                                                console.log('downloaded ' + obj.path + justFile + ' from ' + url);                                                
                                            });
                                        })
                                    }).on('error', (e) => {
                                        console.error(e);
                                    });
                                }
                            });
                        }
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            });
        }).on('error', (e) => {
            console.error(e);
        });
    });
}