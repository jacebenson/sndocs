var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 8000;
var localPath2 = path.join(__dirname, '/public');
console.log('Running locally here => http://localhost:' + port);
app.use(express.static(localPath2));
app.listen(port);
