let http = require('http');
let fs = require('fs-extra');
let path = require('path');

(async () => {
  
  let clientHtmlPath = path.join(__dirname, 'client.html');
  let serverActive = null;
  let clientHtml = null;
  
  let server = http.createServer((request, response) => {
    
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(clientHtml);
    
  });
  
  let port = 80;
  let host = 'localhost';
  
  [ serverActive, clientHtml ] = await Promise.all([
    new Promise(r => server.listen(port, host, r)),
    fs.readFile(clientHtmlPath)
  ]);
  
  server.listen(port, host);
  
})();


