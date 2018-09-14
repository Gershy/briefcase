let http = require('http');
let fs = require('fs-extra');
let path = require('path');

(async () => {
  
  let clientHtmlPath = path.join(__dirname, 'client.html');
  let serverActive = null;
  let clientHtml = null;
  
  let server = http.createServer(async (request, response) => {
    
    console.log(request.method, request.url);
    
    let method = request.method.toLowerCase();
    let url = request.url;
    
    let responseFunc = ({
      
      'get /': async () => {
        
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(clientHtml);
        
      },
      'get /favicon': async () => {
        
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('No favicon yet :(');
        
      }
      
    })[`${method} ${url}`];
    
    if (!responseFunc) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(`dunno: ${method} ${url}`);
      console.log(`error: ${method} ${url}`);
      return;
    }
    
    await responseFunc();
    console.log(`served: ${method} ${url}`);
    
  });
  
  let port = 80;
  let host = 'localhost';
  
  [ serverActive, clientHtml ] = await Promise.all([
    new Promise(r => server.listen(port, host, r)),
    (async () => {
      
      let [ clientHtml, clientCss, clientJs ] = await Promise.all([
        fs.readFile(path.join(__dirname, 'client', 'client.html'), 'utf8'),
        fs.readFile(path.join(__dirname, 'client', 'client.css'), 'utf8'),
        fs.readFile(path.join(__dirname, 'client', 'client.js'), 'utf8')
      ]);
      
      let replacements = {
        css: clientCss,
        js: clientJs
      };
      for (const [placeholder, content] of Object.entries(replacements)) {
        
        let pcs = clientHtml.split(`{{${placeholder}}}`);
        
        let newHtml = [];
        for (let i = 0; i < pcs.length - 1; i++) {
          let pc = pcs[i];
          let ind = pc.length - 1;
          while (pc[ind] === ' ') ind--;
          let spaces = ' '.repeat(pc.length - ind);
          let indented = content.trim().split('\n').map((line, ind) => !ind ? line : spaces + line).join('\n');
          newHtml.push(pc, indented);
          
        }
        newHtml.push(pcs[pcs.length - 1]);
        
        clientHtml = newHtml.join('');
        
      }
      
      return clientHtml;
      
    })()
  ]);
  
  console.log('Server ready');
  
  
})();


