var fs = require("fs");
var download = require("download");
var wd = process.env.PWD;
var arguments = process.argv;
var instance = 'https://dev.service-now.com';
var out = false;
for (var index = 0; index < arguments.length; index++) {
  var argument = arguments[index];
  if (argument === "-o" || argument === "--out") {
    out = arguments[index + 1];
  }
}
var arrayOfFiles = [
  "/scripts/js_includes_sp.jsx",
  "/sn.dragdrop.jsdbx",
  "/scripts/glide-highcharts-v5.js",
  "/scripts/SLARepairClient.js",
  "/scripts/app.guided_tours/js_guided_tours_includes.jsx",
  "/scripts/classes/doctype/js_includes_listv2_doctype.jsx",
  "/scripts/doctype/js_includes_doctype.jsx",
  "/scripts/doctype/js_includes_last_doctype.jsx",
  "/scripts/doctype/z_last_include.js",
  "/scripts/form_tags.jsx",
  "/scripts/heisenberg/heisenberg_all.jsx",
  "/scripts/js_includes_amb.jsx",
  "/scripts/js_includes_customer.jsx",
  "/scripts/js_includes_form_presence.jsx",
  "/scripts/js_includes_list_edit_doctype.jsx",
  "/scripts/js_includes_sorting_new.jsx",
  "/scripts/js_includes_ui16_form.jsx",
  "/scripts/lib/newtag-it.jsx",
  "/scripts/magellan.CreateFavoriteModal.jsx",
  "/scripts/transaction_scope_includes.jsx",
  "/scripts/sn/concourse/js_includes_concourse.jsx",
  "/scripts/ui_policy.jsx"
];
console.log(arrayOfFiles);
arrayOfFiles.map(function(x) {
  console.log(x);
  getit(instance + x, out);
});
console.log("Two things left to do;");
console.log(
  "Make the code, pretty and make them HTML files, do that by running these"
);
console.log("js-beautify -q -r -f ./.sn/*.js");
console.log("docco ./.sn/*.js");

function getit(url, out, callback) {
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
    } else if (!out) {
      console.log("--out not defined");
    } else if (!url) {
      console.log("--url not defined");
    }
  } catch (err) {
    console.log(err);
  }
}
