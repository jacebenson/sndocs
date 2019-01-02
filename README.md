[![pipeline status](https://gitlab.com/jacebenson/sndocs/badges/master/pipeline.svg)](https://gitlab.com/jacebenson/sndocs/commits/master)

# SNDocs

Downloads scripts and make HTML pages for them.

## Install

```bash
npm install #local packages
```

## Usage

```bash
npm run download #tries to download all the files from an instance meeting the family and patch
# does a bunch of stuff... takes a while, 300+ files per family/version, as of 10/12/2017 its 14 versions
npm run build #builds a updated html file based on data.json
# data.json requires manual update for new families, and patches
```

## Testing

```bash
npm run test # loads up /public to localhost:8000
```

## License

MIT