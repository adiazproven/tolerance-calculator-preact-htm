var http = require('http');

var serveHandler = require('serve-handler');

http.createServer((req, res) => serveHandler(req, res, {
    // public: './'
    public: './src'
    // public: './index.html'
})).listen(8000);