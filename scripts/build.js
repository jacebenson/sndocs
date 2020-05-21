// instead of getting the instances... vesrions lets just make some... assumptions about versions by 
// available pages.
// e.g. if https://docs.servicenow.com/bundle/orlando-release-notes/page/release-notes/quality/orlando-patch-0.html returns 200 assume it's a version
// if https://docs.servicenow.com/bundle/orlando-release-notes/page/release-notes/quality/orlando-patch-1.html returns not 200 assume its not a thing

/*
      "name": "Orlando",
      "url": "https://docs.servicenow.com/bundle/orlando-release-notes/page/release-notes/family-release-notes.html",
      "date": "2020-01-06",
      "endDate": null,
      "patches": [

        {
          "number": "0",
          "name": "Orlando Patch 0",
          "url": "https://docs.servicenow.com/bundle/orlando-release-notes/page/release-notes/quality/orlando-patch-0-hf-1.html",
          "hi": "KB0793252",
          "date": "2020-01-29",
          "hotFixes": ["Hot Fix 1"]
        }
      ],
      "features": [
*/
var https = require('https');
var rp = require('request-promise');
var $ = require('cheerio');
var getPatches = function (url) {
    var urlObj = new URL(url);
    urlObj.fullpath = (function(){
        var urlArr = urlObj.pathname.split('/');
        urlArr.length = urlArr.length-1;
        return 'https://' + urlObj.hostname + urlArr.join('/') + '/'
    })();
    rp(url)
        .then(function (html) {
            //success
            var links = $('td > a', html);
            console.log(links.length);
            //links.forEach(function(link){
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var linkTitle = $(link).text().replace('\n','').replace(/\s\s+/g, ' ');
                if(link.attribs.href.indexOf('quality')>=0 && linkTitle.indexOf('Hotfix') == -1){
                    console.log(urlObj.fullpath + link.attribs.href, linkTitle);
                }
            }
        });
};
//h 6 https://docs.servicenow.com/bundle/newyork-release-notes/page/release-notes/quality/newyork-patch-6.html
//https://docs.servicenow.com/bundle/newyork-release-notes/page/release-notes/available-versions.html
var p = getPatches('https://docs.servicenow.com/bundle/orlando-release-notes/page/release-notes/available-versions.html');
console.log(p);
var docsUrl = (function (family, patch) {
    family = family.replace(' ', '').toLowerCase();
    return 'https://docs.servicenow.com/bundle/' + family + '-release-notes/page/release-notes/quality/' + family + '-patch-' + patch + '.html';
});
var data = require('../data/versions.json');//load the good data... for new records.
console.log(data.length);
data.forEach(function (version) {
    version.patches.forEach(function (patch) {
        //console.log(patch.name, docsUrl(version.name, patch.number));
        //validPage(docsUrl(version.name, patch.number));
    });
});