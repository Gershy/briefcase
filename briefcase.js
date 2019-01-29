let [ http, fs, path ] = [ 'http', 'fs', 'path' ].map(require);

let args = {
  host: 'localhost',
  port: '80',
  state: path.join(__dirname, '..', 'witbState.txt'),
  ...process.argv.slice(2).join('~').trim().split('--').reduce((obj, v) => {
    if (v) { let [ k, ...vs ] = v.trim().split('~'); obj[k] = vs.filter(v => !!v).join('~'); }
    return obj;
  }, {})
};

let statePath = path.normalize(args.state);
let data = null;
try {
  data = JSON.parse(fs.readFileSync(statePath));
} catch(err) {
  console.log('Couldn\'t read saved state (created new state)');
  data = {
    available: {
      thing1: { name: 'Thing1', price: 1, size: 0.1, imageUrl: 'assets/img/thing1.png' },
      thing2: { name: 'Thing2', price: 2, size: 0.1, imageUrl: 'assets/img/thing2.png' },
      thing3: { name: 'Thing3', price: 3, size: 0.1, imageUrl: 'assets/img/thing3.png' }
    },
    inserted: {}
  };
};

// Save to disk every so often
setInterval(() => fs.writeFile(statePath, JSON.stringify(data), ()=>{}), 10000);

let router = {
  'get /': async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'simple.html')).pipe(res);
  },
  'get /favicon.ico': async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    fs.createReadStream(path.join(__dirname, 'assets', 'favicon.ico')).pipe(res);
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
  },
  'get /setAvailable': async(req, res) => {
    // The whole JSON string is being sent in the URL, yuck
    let newAvailable = JSON.parse(decodeURIComponent(req.url.substr(('/setAvailable?').length)));
    data.available = newAvailable;
    
    // Remove inserted snacks which no longer exist
    for (let snackId in data.inserted) if (!data.available.hasOwnProperty(snackId)) delete data.inserted[snackId];
    
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(JSON.stringify(data));
  }
};

let server = http.createServer(async (req, res) => {

  let method = req.method.toLowerCase();
  let url = req.url;
  
  let match = (req.url.match(/^\/[^/?]*/) || [ '/' ])[0];
  let routerStr = `${req.method.toLowerCase()} ${match}`;
  
  console.log(`serving: ${req.connection.remoteAddress} -> ${routerStr} (${url})`);
  
  if (!router.hasOwnProperty(routerStr)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end(`Invalid endpoint: ${req.method} ${req.url}`);
  }
  
  try { await router[routerStr](req, res); } catch(err) {
    console.log('Error in router:', err.stack);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end(`Invalid req: ${req.method} ${req.url} -> ${err.message}`);
  }

});

server.listen(args.port, args.host, () => console.log('Server ready'));
