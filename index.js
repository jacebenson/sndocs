var fs = require("fs");
var download = require("download");
var wd = process.env.PWD;
//$ node index.js --url "https://hi.service-now.com/scripts/js_includes_sp.jsx" --out ./sn
//js-beautify -f ./sn/*.js -r
//docco ./sn/*.js
var arguments = process.argv;
var url = false;
var out = false;
//console.log(arguments);
for (var index = 0; index < arguments.length; index++) {
  var argument = arguments[index];
  if (argument === "-u" || argument === "--url") {
    url = arguments[index + 1];
    //console.log('URL: ' + arguments[index+1]);
  }
  if (argument === "-o" || argument === "--out") {
    out = arguments[index + 1];
    //console.log('OUT: ' + arguments[index+1]);
  }
}
try {
  if (out && url) {
    download(url, out).then(() => {
      var urlArr = url.split("/");
      var domain = url.split(".com/")[0] + ".com";
      //console.log("Downloaded Successful");
      if (out.charAt(out.length != "/")) {
        out += "/";
      }
      var file = out + urlArr[urlArr.length - 1];
      //console.log("Opening file: " + file);
      //console.log("File Exists: " + fs.existsSync(file));
      fs.readFile(file, (err, data) => {
        if (data) {
          data = data.toString();
          //console.log("recieved data: " + data.length);
          var regex = /(\/\*\! RESOURCE: )(.+)\*\//g;
          var found_resources = data.match(regex); //array of comments
          for (
            var downloadIndex = 0;
            downloadIndex < found_resources.length;
            downloadIndex++
          ) {
            var resource = found_resources[downloadIndex].toString();
            resource = resource.split("/*! RESOURCE: ")[1].split(" */")[0];
            resource = domain + resource;
            //console.log("Downloading: " + resource);
            download(resource, out);
          }
        }
      });
    });
    console.log('Two things left to do;');
    console.log('Make the code, pretty and make them HTML files, do that by running these');
    console.log('js-beautify -q -r -f ./sn/*.js');
    console.log('docco ./sn/*.js');
  } else if (!out) {
    console.log("--out not defined");
  } else if (!url) {
    console.log("--url not defined");
  }
} catch (err) {
  console.log(err);
}
