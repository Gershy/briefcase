let fs = require('fs-extra');
let path = require('path');

var sampleObject = {
  a: 1,
  b: 2,
  c: {
    x: 11,
    y: 22
  }
};

(async () => {
  
  let saveFilePath = path.join(__dirname, '..', 'snackInfo', 'object.json');
  await fs.writeFile(saveFilePath, JSON.stringify(sampleObject));
  console.log('Saved!');
  
})();
