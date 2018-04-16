var fs =  require('fs');
var families = require('./public/js/data.json');

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
    {'itunes:subtitle': 'Unofficial Servicenow release list'},
    {'itunes:author': 'John Doe'},
    {'itunes:summary': 'All about SN Releases'},
    {'itunes:owner': [
      {'itunes:name': 'John Doe'},
      {'itunes:email': 'john.doe@example.com'}
    ]},
    {'itunes:image': {
      _attr: {
        href: 'https://sndocs.jacebenson.com/favicon.png'
      }
    }},
    {'itunes:category': [
      {_attr: {
        text: 'Technology'
      }}
    ]}
  ]
});
//console.log(versions);
families.map(function(family){
  var familyStr = family.name + '';
  //console.log(family.name);
  feed.item({
    title: family.name,
    url: family.url,
    date: family.date
  });
  family.patches.map(function(patch){
    familyStr += ' ' + patch.name;
    if(patch.url == '#'){
      patch.url = 'https://sndocs.jacebenson.com/#' + encodeURIComponent(patch.name);
    }
    feed.item({
      title: patch.name,
      url: patch.url,
      date: patch.date
    });
  });
});
fs.writeFile('./public/rss.xml', feed.xml({indent: true}), function (err){
  if(err) return console.log(err);
  console.log('created ./rss.xml');
});
/**
 * Require Browsersync
 */
var browserSync = require('browser-sync')

/**
 * Run Browsersync with server config
 */
browserSync({
  server: 'public',
  files: ['public/*.html', 'public/*.xml', 'public/css/*.css', 'public/js/*.json']
})
