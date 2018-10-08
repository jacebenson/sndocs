var fs = require('fs');
var feedData = require('./data.json');
var families = feedData.reverse();
// console.log(families)
/**
 * Generate the RSS feed
 */
var RSS = require('rss');

/* lets create an rss feed */
var feed = new RSS({
  title: 'SNDocs',
  description: 'Unofficial Servicenow release list',
  feed_url: 'https://sndocs.jacebenson.com/rss.xml',
  site_url: 'https://sndocs.jacebenson.com',
  image_url: 'https://sndocs.jacebenson.com/favicon.png',
  language: 'en',
  pubDate: new Date(),
  ttl: '60',
  custom_namespaces: {
    'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
  },
  custom_elements: [
    { 'itunes:subtitle': 'Unofficial Servicenow release list' },
    { 'itunes:author': 'John Doe' },
    { 'itunes:summary': 'All about SN Releases' },
    {
      'itunes:owner': [
        { 'itunes:name': 'John Doe' },
        { 'itunes:email': 'john.doe@example.com' }
      ]
    },
    {
      'itunes:image': {
        _attr: {
          href: 'https://sndocs.jacebenson.com/favicon.png'
        }
      }
    },
    {
      'itunes:category': [
        {
          _attr: {
            text: 'Technology'
          }
        }
      ]
    }
  ]
});
// console.log(versions);
feedData.map(function (family) {
  // var familyStr = family.name + '';
  // console.log(family.name);
  feed.item({
    guid: family.name,
    title: family.name,
    url: family.url,
    date: family.date
  });
  family.patches.map(function (patch) {
    // familyStr += ' ' + patch.name;
    if (patch.url === '#') {
      patch.url = 'https://sndocs.jacebenson.com/#' + encodeURIComponent(patch.name);
    }
    feed.item({
      guid: patch.name,
      title: patch.name,
      url: patch.url,
      date: patch.date
    });
  });
});
fs.writeFile('./public/rss.xml', feed.xml({ indent: true }), function (err) {
  if (err) return console.log(err);
  console.log('created ./rss.xml');
});

/**
 * Build HTML
 */
var headerColSpan = 22;
var Table = require('table-builder');
var headers = {
  'name': 'Family',
  'url': 'Docs',
  'patches': 'Patches',
  'features': 'Features'
};
var tableHTML = (new Table({ 'class': 'table table-responsive table-hover' }))
  .setHeaders(headers)
  .setPrism('patches', function (patches, row) {
    var returnHTML = '';
    patches.map(function (patch) {
      // console.log(patch);
      returnHTML += '<td>';
      returnHTML += '<div class="' + row + ' patchcol">';
      returnHTML += '  <div class="col-12">';
      if (patch.url) {
        returnHTML += '    <a title="' + patch.name + ' Notes" href="' + patch.url + '">';
      }
      returnHTML += '      <strong>' + patch.number + '</strong>';
      if (patch.url) {
        returnHTML += '    </a>';
      }
      returnHTML += '  </div>';
      returnHTML += '  <div class="col-12">';
      if (patch.hi) {
        returnHTML += '    <a title="' + patch.name + ' Security KB" href="' + patch.hi + '">';
      }
      returnHTML += '      <i class="fa fa-power-off"></i>';
      if (patch.hi) {
        returnHTML += '    </a>';
      }
      returnHTML += '  </div>';
      returnHTML += '  <div class="col-12">';
      if (patch.git) {
        returnHTML += '    <a title="' + patch.name + ' Code" href="' + patch.git + '">';
      }
      returnHTML += '      <i class="fa fa-code-fork"></i>';
      if (patch.git) {
        returnHTML += '    </a>';
      }
      returnHTML += '  </div>';
      returnHTML += '</div>';
      returnHTML += '</td>';
    });
    // console.log(row.name + ': ' + patches.length);
    for (var col = patches.length; col < headerColSpan; col++) {
      returnHTML += '<td></td>';
    }
    return returnHTML;
  })
  .setPrism('family', function (cellData, row) {
    var returnHTML = '';
    if (cellData) {
      returnHTML += cellData;
    }
    return returnHTML;
  })
  .setPrism('url', function (cellData, row) {
    var returnHTML = '';
    if (cellData) {
      // returnHTML += cellData;
      returnHTML += '    <a title="Family Patch Notes" href="' + cellData + '">';
      returnHTML += '      <i class="fa fa-power-off"></i>';
      returnHTML += '    </a>';
    }
    return returnHTML;
  })
  .setPrism('features', function (cellData, row) {
    var returnHTML = '';
    if (cellData) {
      cellData.map(function (feature) {
        returnHTML += '<div><a href="https://docs.servicenow.com/search?q=' + feature + '">' + feature + '</a></div>';
      });
      return returnHTML;
    } else {
      return 'Unknown';
    }
  })
  .setData(families)
  .render();
var indexHTML = '';
indexHTML += '<html>';
indexHTML += '<head>';
indexHTML += '    <meta charset="utf-8">';
indexHTML += '    <meta http-equiv="x-ua-compatible" content="ie=edge"> <!-- † -->';
indexHTML += '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
indexHTML += '    <meta name="description" content="A history of SN versions">';
indexHTML += '    <meta name="robots" content="index,follow"><!-- All Search Engines -->';
indexHTML += '    <meta name="googlebot" content="index,follow"><!-- Google Specific -->';
indexHTML += '    <meta name="generator" content="nodejs">';
indexHTML += '    <title>SN Versions</title>';
indexHTML += '    <meta http-equiv="cache-control" content="max-age=0" />';
indexHTML += '    <meta http-equiv="cache-control" content="no-cache" />';
indexHTML += '    <meta http-equiv="expires" content="0" />';
indexHTML += '    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />';
indexHTML += '    <meta http-equiv="pragma" content="no-cache" />';
indexHTML += '    <link rel="icon" href="./css/images/favicon.png" />';
indexHTML += '</head>';
indexHTML += '<body>';
indexHTML += '    <header>';
indexHTML += '        <script src="./js/jquery-3.2.1.min.js"></script>';
indexHTML += '        <script src="./js/bootstrap.min.js"></script>';
indexHTML += '        <link href="./css/bootstrap.min.css" rel="stylesheet"></link>';
indexHTML += '        <link href="./css/fontawesome.css" rel="stylesheet"></link>';
indexHTML += '        <script src="./js/script.js"></script>';
indexHTML += '        <style>.patchcol {';
indexHTML += '          width: 0px;';
indexHTML += '        }</style>';
indexHTML += '    </header>';
indexHTML += '    <div class="container-fluid">';
indexHTML += '        <div class="row">';
indexHTML += '            <div class="col-sm-4" >Unofficial SN Release List</div>';
indexHTML += '            <div class="col-sm-2">';
indexHTML += '                <a href="https://gitlab.com/jacebenson/sndocs/commits/master">';
indexHTML += '                    <img alt="pipeline status" src="https://gitlab.com/jacebenson/sndocs/badges/master/pipeline.svg" />';
indexHTML += '                </a>';
indexHTML += '            </div>';
indexHTML += '            <div class="col-sm-2">Last Updated:' + new Date().toISOString() + '</div>';
indexHTML += '            <div class="col-sm-1"><a href="/rss.xml">RSS <i class="fa fa-rss-square" aria-hidden="true"></i></a></div>';
indexHTML += '        </div>';
indexHTML += tableHTML;
indexHTML += '    </div>';
indexHTML += '    <style>';
indexHTML += '        .file-text {';
indexHTML += '            font-size: 8px;';
indexHTML += '            margin-left: -1.5em;';
indexHTML += '        }';
indexHTML += '        td {';
indexHTML += '            padding: 15px !important;';
indexHTML += '        }';
indexHTML += '    </style>';
indexHTML += '    <script>$( document ).ready(function() {jQuery(".patches-th").attr("colspan","' + parseInt(headerColSpan + 1, 10) + '");});</script>';
fs.writeFile('./public/index.html', indexHTML, function (err) {
  if (err) return console.log(err);
  console.log('created ./index.html');
});
