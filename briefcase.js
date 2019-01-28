let http = require('http');
let fs = require('fs-extra');
let path = require('path');

let args = process.argv.slice(2).join('~').trim().split('--').reduce((obj, v) => {
  if (v) { let [ k, ...vs ] = v.trim().split('~'); obj[k] = vs.filter(v => !!v).join('~'); }
  return obj;
}, {});

if (!args.hasOwnProperty('host')) args.host === 'localhost'; // throw new Error('Missing "host" param');
if (!args.hasOwnProperty('port')) args.port === '80'; // throw new Error('Missing "port" param');

let data = {
  available: {
    sweetChilliHeat: {
      name: 'Sweet Chilli Heat',
      price: 4.5,
      imageUrl: 'assets/img/sch.png'
    },
    missVickiesJalapeno: {
      name: 'Jalapeno',
      price: 4.5,
      imageUrl: 'assets/img/mvj.png'
    },
    peech: {
      name: 'Fuzzy Peaches',
      price: 3,
      imageUrl: 'assets/img/peech.png'
    },
    gumz: {
      name: 'Wine Gums',
      price: 3,
      imageUrl: 'assets/img/gums.png'
    },
    cornChips: {
      name: 'Corn Chips',
      price: 3,
      imageUrl: 'assets/img/cornChip.png'
    },
    creamyDip: {
      name: 'Creamy Dip',
      price: 5,
      imageUrl: 'assets/img/creamyDip.png'
    },
    salsa: {
      name: 'Salsa',
      price: 5,
      imageUrl: 'assets/img/salsa.png'
    }
  },
  inserted: {}
};

(async () => {

  let router = {
    'get /': async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(__dirname, 'simple.html')).pipe(res);
    },
    'get /favicon': async (req, res) => {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No favicon yet :(');
    },
    'get /assets': async (req, res) => {
      let pcs = req.url.split('/');
      if (pcs[pcs.length - 1].indexOf('.') === -1) throw new Error(`Invalid path: ${req.url}`);

      lastPc = pcs[pcs.length - 1].split('.');
      let ext = lastPc[lastPc.length - 1];

      let contentTypes = ({
        png: 'image/png',
        jpg: 'image/jpg',
        jpeg: 'image/jpg'
      });
      if (!contentTypes.hasOwnProperty(ext)) throw new Error(`Invalid path: ${req.url}`);

      res.writeHead(200, { 'Content-Type': contentTypes[ext] });
      fs.createReadStream(path.join(__dirname, ...pcs)).pipe(res); // TODO: Vulnerability if `pcs` contains ".."
    },
    'get /updateData': async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(JSON.stringify(data));
    },
    'get /addInserted': async (req, res) => {
      let snackId = req.url.substr(('/addInserted?').length);
      if (!data.available.hasOwnProperty(snackId)) throw new Error(`Invalid snackId: ${snackId}`);
      
      if (!data.inserted.hasOwnProperty(snackId)) data.inserted[snackId] = 0;
      data.inserted[snackId]++;
      
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(JSON.stringify(data));
    },
    'get /remInserted': async (req, res) => {
      let snackId = req.url.substr(('/remInserted?').length);
      if (!data.available.hasOwnProperty(snackId)) throw new Error(`Invalid snackId: ${snackId}`);
      if (!data.inserted.hasOwnProperty(snackId)) throw new Error(`No "${snackId}" snacks inserted`);
      
      data.inserted[snackId]--;
      if (!data.inserted[snackId]) delete data.inserted[snackId];
      
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(JSON.stringify(data));
    }
  };
  
  let server = http.createServer(async (request, response) => {

    let method = request.method.toLowerCase();
    let url = request.url;
    
    let match = (request.url.match(/^\/[^/?]*/) || [ '/' ])[0];
    let routerStr = `${request.method.toLowerCase()} ${match}`;
    
    console.log(`serving: ${routerStr} (${url})`);
    
    if (!router.hasOwnProperty(routerStr)) {
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      return response.end(`Invalid endpoint: ${request.method} ${request.url}`);
    }
    
    try { await router[routerStr](request, response); } catch(err) {
      console.log('Error in router:', err.stack);
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      return response.end(`Invalid request: ${request.method} ${request.url} -> ${err.message}`);
    }

  });
  
  await new Promise(r => server.listen(args.port, args.host, r));

  console.log('Server ready');

})();
