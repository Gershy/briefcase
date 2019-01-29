(async () => {

let poll = async (cmd, params=null) => {
  let req = new XMLHttpRequest();
  req.open('GET', cmd, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(JSON.stringify(params));
  
  return new Promise(r => {
    req.onreadystatechange = () => {
      if (req.readyState !== 4) return;
      if (req.responseText.length === 0) return;
      try { r(JSON.parse(req.responseText)); } catch(err) { r(null); }
    };
  });
};

await new Promise(r => window.addEventListener('load', r));

let div = c => { let d = document.createElement('div'); d.classList.add(c); return d; }

let body = document.body;

let logoDom = body.appendChild(div('logo'));

let snackControl = body.appendChild(div('snackControl'));
let availableDom = snackControl.appendChild(div('available'));
let insertedDom = snackControl.appendChild(div('inserted'));

let adminOpen = false;
let adminDom = body.appendChild(div('admin'));
let adminAvailableContent = adminDom.appendChild(document.createElement('textarea'));
adminAvailableContent.classList.add('availableContent');

let adminUpdateButtonDom = adminDom.appendChild(div('button'))
adminUpdateButtonDom.innerText = 'Update!';
adminUpdateButtonDom.addEventListener('mousedown', async () => {
  try {
    let parsedAvail = JSON.parse(adminAvailableContent.value);
    let upd = await poll(`setAvailable?${encodeURIComponent(JSON.stringify(parsedAvail))}`);
    await update(upd);
    adminOpen = false;
    adminDom.classList.remove('open');
  } catch(err) {
    alert('bad!');
  }
});

let adminButtonDom = body.appendChild(div('adminButton'));
adminButtonDom.addEventListener('mousedown', () => {
  adminDom.classList[adminOpen ? 'remove' : 'add']('open');
  adminOpen = !adminOpen;
  
  if (adminOpen) {
    let curAvail = {};
    for (let k in available) curAvail[k] = available[k].snackData;
    adminAvailableContent.value = JSON.stringify(curAvail, null, 2);
  }
});

let statusDom = body.appendChild(div('status'));
let statusTextDom = statusDom.appendChild(div('text'));

let skullDom = body.appendChild(div('skull'));

let available = {};
let updateAvailable = upd => {
  /*
  upd ~= {
    sweetChilliHeat: {
      name: 'Sweet Chilli Heat',
      price: 4.5,
      imageUrl: '/assets/img/sch.png'
    }
  }
  */
  
  // Remove snacks no longer available
  for (let [ snackId, snackData ] of Object.entries(available)) {
    if (!upd.hasOwnProperty(snackId)) {
      available[snackId].snackDom.parentNode.removeChild(available[snackId].snackDom);
      delete available[snackId];
    }
  }
  
  for (let [ snackId, snackData ] of Object.entries(upd)) {
    
    // Initial setup
    if (!available.hasOwnProperty(snackId)) {
      let snackDom = availableDom.appendChild(div('snack'));
      snackDom.classList.add(snackId);
      snackDom.snackId = snackId;
      let snackTextDom = snackDom.appendChild(div('text'));
      
      snackDom.addEventListener('mousedown', async () => {
        snackDom.classList.add('waiting');
        let upd = await poll(`addInserted?${snackDom.snackId}`); // Do the add
        await update(upd);
        snackDom.classList.remove('waiting');
        logoDom.classList.remove('less', 'more');
        requestAnimationFrame(() => requestAnimationFrame(() => logoDom.classList.add('more')));
      });
      available[snackId] = { snackData, snackDom };
    }
    
    available[snackId].snackData = snackData;
    available[snackId].snackDom.getElementsByClassName('text')[0].innerText = snackData.name;
  }
  
};

let inserted = {};
let updateInserted = (snackCounts) => {
  
  // Remove any snacks that have dropped to 0
  for (let [ snackId, snackIns ] of Object.entries(inserted)) {
    if (!snackCounts.hasOwnProperty(snackId)) {
      snackIns.snackDom.parentNode.removeChild(snackIns.snackDom);
      delete inserted[snackId];
    } else {
      snackIns.snackData = available[snackId];
    }
  }
  
  let fullness = 0;
  for (let [ snackId, count ] of Object.entries(snackCounts)) {
    
    // Get data
    let snackData = available[snackId].snackData;
    
    // Initial setup
    if (!inserted.hasOwnProperty(snackId)) {
      
      // Create dom
      let snackDom = insertedDom.appendChild(div('snack'));
      snackDom.classList.add(snackId);
      let snackTextDom = snackDom.appendChild(div('text'));
      snackDom.snackId = snackId;
      snackDom.addEventListener('mousedown', async () => {
        snackDom.classList.add('waiting');
        let upd = await poll(`remInserted?${snackDom.snackId}`); // Do the removal
        await update(upd);
        snackDom.classList.remove('waiting');
        logoDom.classList.remove('less', 'more');
        requestAnimationFrame(() => requestAnimationFrame(() => logoDom.classList.add('less')));
      });
      
      inserted[snackId] = { snackData, snackDom, count: 0 };
      
    }
    
    // Update count and dom
    inserted[snackId].count = count;
    inserted[snackId].snackDom.getElementsByClassName('text')[0].innerText = `${snackData.name} (x ${count})`;
    fullness += count * (snackData.hasOwnProperty('size') ? snackData.size : 0.1);
    
  }
  
  statusDom.classList.remove('warning', 'critical', 'fatal', 'infernal', 'apocalyptic');
  statusTextDom.innerText = '';
  skullDom.classList.remove('open');
  if (fullness > 5) {
    statusDom.classList.add('apocalyptic');
    statusTextDom.innerText = 'RRRAHHHHHH';
    skullDom.classList.add('open');
  } else if (fullness > 3) {
    statusDom.classList.add('infernal');
    statusTextDom.innerText = 'EEEUURRGHHHH';
  } else if (fullness > 1.4) {
    statusDom.classList.add('fatal');
    statusTextDom.innerText = 'AUUGgHHuGG';
  } else if (fullness > 0.9) {
    statusDom.classList.add('critical');
    statusTextDom.innerText = 'Warning: briefcase is VERY full!';
  } else if (fullness > 0.7) {
    statusDom.classList.add('warning');
    statusTextDom.innerText = 'Warning: briefcase nearing capacity';
  }
  
};

let updateTimeout = null;
let update = async (data) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(update, 2000);
  if (!data) data = await poll('updateData');
  updateAvailable(data.available);
  updateInserted(data.inserted);
  return data;
}

let loading = snackControl.appendChild(div('loading'));
loading.innerText = 'Loading...';

await update();
snackControl.removeChild(loading);

})();
