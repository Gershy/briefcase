let http = require('http');
let fs = require('fs');
let path = require('path');

let port = 80;
let host = 'localhost';
let server = http.createServer((request, response) => {
  
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('hahaha');
  
});

server.listen(port, host);
