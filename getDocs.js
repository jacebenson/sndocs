var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
request("https://docs.servicenow.com/", function (error, response, body) {
    if (error) {
        console.log("Error: " + error);
    }
    console.log("Status code: " + response.statusCode + ' = ' + 'https://docs.servicenow.com/');

    var $ = cheerio.load(body);

    $('.list-locations .location-entry > h5').each(function (index) {
        var family = $(this).text().toString()
        var familyLink  = $(this).attr('id');
        var excludeUrls = [
            'https://docs.servicenow.com/category/a',
            'https://docs.servicenow.com/category/b',
            'https://docs.servicenow.com/bundle/archive/page/archive/fuji-archive.html'
        ];
        if(excludeUrls.indexOf(familyLink)==-1){
        request(familyLink, function (error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }
            console.log("Status code: " + response.statusCode + ' = ' + familyLink);

            var $2 = cheerio.load(body);

            $2('.ReleaseNotes_01').each(function (index) {
                var element = $(this).next();
                var familyPatchesUrl = $(element).attr('id');
                console.log(familyPatchesUrl);
                request(familyPatchesUrl, function (error, response, body) {
                    if (error) {
                        console.log("Error: " + error);
                    }
                    console.log("Status code: " + response.statusCode + ' = ' + familyPatchesUrl);
                    var $3 = cheerio.load(body);
                    $3('ul a:contains(Patch)').each(function(index){
                        console.log($(this).attr('href'));
                    });
                });
            });
        });
    }
    });
});