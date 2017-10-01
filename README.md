# ![pageres](media/promo.png)

Downloads scripts and make HTML pages for them.

## Install

```
$ npm install jsdocs -g
$ npm install js-beautify -g
$ npm install docco -g
```

*I tried to include the above globally installed npm packages but they aren't made to run in a js file I read.  Until someone else can help with that this is what it is.*


## Usage

```
$ node index.js --url "https://hi.service-now.com/scripts/js_includes_sp.jsx" --out ./sn
$ js-beautify -f ./sn/*.js -r
$ docco ./sn/*.js
```

## CLI

### options
 
#### URL

* -u 
* --url 

Purpose: for the thing you want to download
#### OUT

* -o
* --out 

Purpose: for the place your want to download it to.

## License

MIT