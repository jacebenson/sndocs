[![pipeline status](https://gitlab.com/jacebenson/sndocs/badges/master/pipeline.svg)](https://gitlab.com/jacebenson/sndocs/commits/master)

# SNDocs

Downloads scripts and make HTML pages for them.

## Install

```
$ npm install #installs "docco" globally and required local packages
```

## Usage

```
$ npm start #tries to download all the files from an instance meeting the family and patch
$ # does a bunch of stuff... takes a while, 300+ files per family/version, as of 10/12/2017 its 14 versions
$ ./
$ docco ./sources/helsinki/11b/*.js -o ./docs/helsinki/11b #makes html for files
$ docco ./sources/helsinki/12/*.js -o ./docs/helsinki/12 #makes html for files
$ docco ./sources/helsinki/12a/*.js -o ./docs/helsinki/12a #makes html for files

$ docco ./sources/instanbul/4/*.js -o ./docs/istanbul/4 #makes html for files
$ docco ./sources/instanbul/5/*.js -o ./docs/istanbul/5 #makes html for files
$ docco ./sources/instanbul/6/*.js -o ./docs/istanbul/6 #makes html for files
$ docco ./sources/instanbul/6a/*.js -o ./docs/istanbul/6a #makes html for files
$ docco ./sources/instanbul/7/*.js -o ./docs/istanbul/7 #makes html for files
$ docco ./sources/instanbul/8/*.js -o ./docs/istanbul/8 #makes html for files
$ docco ./sources/instanbul/9/*.js -o ./docs/istanbul/9 #makes html for files

$ docco ./sources/jakarta/2/*.js -o ./docs/jakarta/2 #makes html for files
$ docco ./sources/jakarta/3/*.js -o ./docs/jakarta/3 #makes html for files
$ docco ./sources/jakarta/3a/*.js -o ./docs/jakarta/3a #makes html for files
```

## CLI

## License

MIT