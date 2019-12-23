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

// destination.txt will be created or overwritten by default.
fs.copyFile('data.json', './public/data.json', (err) => {
  if (err) throw err;
  console.log('data.json was copied to destination.txt');
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
var htmlArr = [];
htmlArr.push('<html>');
htmlArr.push('<head>');
htmlArr.push('    <meta charset="utf-8">');
htmlArr.push('    <meta http-equiv="x-ua-compatible" content="ie=edge"> <!-- † -->');
htmlArr.push('    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">');
htmlArr.push('    <meta name="description" content="A history of SN versions">');
htmlArr.push('    <meta name="robots" content="index,follow"><!-- All Search Engines -->');
htmlArr.push('    <meta name="googlebot" content="index,follow"><!-- Google Specific -->');
htmlArr.push('    <meta name="generator" content="nodejs">');
htmlArr.push('    <title>SN Versions</title>');
htmlArr.push('    <meta http-equiv="cache-control" content="max-age=0" />');
htmlArr.push('    <meta http-equiv="cache-control" content="no-cache" />');
htmlArr.push('    <meta http-equiv="expires" content="0" />');
htmlArr.push('    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />');
htmlArr.push('    <meta http-equiv="pragma" content="no-cache" />');
htmlArr.push('    <link rel="icon" href="./css/images/favicon.png" />');
htmlArr.push('    <link rel="canonical" href="https://sndocs.jace.pro"></link>');
htmlArr.push('</head>');
htmlArr.push('<body>');
htmlArr.push('    <header>');
htmlArr.push('        <script src="./js/jquery-3.2.1.min.js"></script>');
htmlArr.push('        <script src="./js/bootstrap.min.js"></script>');
htmlArr.push('        <link href="./css/bootstrap.min.css" rel="stylesheet"></link>');
htmlArr.push('        <link href="./css/fontawesome.css" rel="stylesheet"></link>');
htmlArr.push('        <script src="./js/script.js"></script>');
htmlArr.push('        <style>.patchcol {');
htmlArr.push('          width: 0px;');
htmlArr.push('        }</style>');
htmlArr.push('    </header>');
htmlArr.push('    <div class="container-fluid">');
htmlArr.push('        <div class="row">');
htmlArr.push('            <div class="col-sm-4" >Unofficial SN Release List</div>');
htmlArr.push('            <div class="col-sm-4">Last Updated:' + new Date().toISOString() + '</div>');
htmlArr.push('            <div class="col-sm-1">');
htmlArr.push('              <a href="/rss.xml">RSS <i class="fa fa-rss-square" aria-hidden="true"></i></a>');
htmlArr.push('              <a href="/chart.html">CHART <i class="fa fa-rss-square" aria-hidden="true"></i></a>');
htmlArr.push('            </div>');
htmlArr.push('        </div>');
htmlArr.push(tableHTML);
htmlArr.push('    </div>');
htmlArr.push('    <style>');
htmlArr.push('        .file-text {');
htmlArr.push('            font-size: 8px;');
htmlArr.push('            margin-left: -1.5em;');
htmlArr.push('        }');
htmlArr.push('        td {');
htmlArr.push('            padding: 15px !important;');
htmlArr.push('        }');
htmlArr.push('    </style>');
htmlArr.push('    <script>$( document ).ready(function() {jQuery(".patches-th").attr("colspan","' + parseInt(headerColSpan + 1, 10) + '");});</script>');
var indexHTML = htmlArr.join('\n');
fs.writeFile('./public/index.html', indexHTML, function (err) {
  if (err) return console.log(err);
  console.log('created ./index.html');
});
