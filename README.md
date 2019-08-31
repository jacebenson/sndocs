# SNDocs
![](screenshot.png)

Downloads scripts and make HTML pages for them.

## Install

```bash
yarn install #local packages
```

## Usage

```bash
yarn download # runs node buildversions.js > output.txt && node download.js > outputdownload.txt && node buildhtml.js
# buildversions makes requests to instances to update versions.json which is used to get js files
# download.js makes requests and saves responses to the /sources/family/patch folder
# buildhtml.js makes the files in /public/ so a page and rss file are generated
```

## Testing

```bash
yarn start # runs light-server on /public by default to port 4000
```

## License

MIT