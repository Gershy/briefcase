let http = require('http');
let fs = require('fs-extra');
let path = require('path');

(async () => {
  
  let clientHtmlPath = path.join(__dirname, 'client.html');
  let serverActive = null;
  let clientHtml = null;
  
  let server = http.createServer((request, response) => {
    
    console.log(request.method, request.url);
    
    let method = request.method.toLowerCase();
    let url = request.url;
    
    let responseFunc = ({
      
      'get /': () => {
        
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(clientHtml);
        
      },
      'get /favicon': () => {
        
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('No favicon yet :(');
        
      }
      
    })[`${method} ${url}`];
    
    if (!responseFunc) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(`dunno: ${method} ${url}`);
      return;
    }
    
    responseFunc();
    
  });
  
  let port = 80;
  let host = 'localhost';
  
  [ serverActive, clientHtml ] = await Promise.all([
    new Promise(r => server.listen(port, host, r)),
    fs.readFile(clientHtmlPath)
  ]);
  
  console.log('Server ready');
  
  
})();


