let http = require('http');
let fs = require('fs-extra');
let path = require('path');

console.log(process.argv.slice(2).join('~').split('--'));

let args = process.argv.slice(2).join('~').trim().split('--').reduce((obj, v) => {
  if (v) { let [ k, ...vs ] = v.split('~'); obj[k] = vs.join('~'); }
  return obj;
}, {});

if (!args.hasOwnProperty('host')) throw new Error('Missing "host" param');
if (!args.hasOwnProperty('port')) throw new Error('Missing "port" param');

(async () => {

  let clientHtmlPath = path.join(__dirname, 'client.html');
  let serverActive = null;
  let clientHtml = null;

  let server = http.createServer(async (request, response) => {

    console.log(request.method, request.url);

    let method = request.method.toLowerCase();
    let url = request.url;

    try {

      if (method === 'get' && url === '/') {

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(clientHtml);

      } else if (method === 'get' && url === '/favicon') {

        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('No favicon yet :(');

      } else if (method === 'get' && url.startsWith('/assets')) {

        let pcs = url.split('/');
        let lastPc = pcs[pcs.length - 1];

        if (!~lastPc.indexOf('.')) throw new Error(`Bad url: ${url}`);

        lastPc = lastPc.split('.');
        let ext = lastPc[lastPc.length - 1];

        let contentType = ({
          png: 'image/png',
          jpg: 'image/jpg',
          jpeg: 'image/jpg'
        })[ext];

        if (!contentType) throw new Error(`Bad asset extension: ${ext}`);

        response.writeHead(200, { 'Content-Type': contentType });

        let filepath = path.join(__dirname, ...pcs);
        fs.createReadStream(filepath).pipe(response);

      } else {

        throw new Error('bad request');

      }

      console.log(`served: ${method} ${url}`);

    } catch(err) {

      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(`dunno: ${method} ${url}`);
      console.log(`error: ${method} ${url} (${err.message})`);
      return;

    }

  });

  [ serverActive, clientHtml ] = await Promise.all([
    new Promise(r => server.listen(args.port, args.host, r)),
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
