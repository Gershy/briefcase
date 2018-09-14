let retrieveSnackDefinition = async () => {
  
  return {
    sweetChilliHeat: {
      id: 'sweetChilliHeat',
      displayName: 'Sweet Chilli Heat',
      brand: 'doritos',
      manufacturer: 'fritoLay'
    },
    nachoCheese: {
      id: 'nachoCheese',
      displayName: 'Nacho Cheese',
      brand: 'doritos',
      manufacturer: 'fritoLay'
    },
    jalapeno: {
      id: 'jalapeno',
      displayName: 'Jalapeno',
      brand: 'missVickies',
      manufacturer: 'fritoLay'
    },
    barbeque: {
      id: 'barbeque',
      displayName: 'Barbeque',
      brand: 'lays',
      manufacturer: 'fritoLay'
    }
  };
  
};

window.onload = async () => {
  
  let snackDef = await retrieveSnackDefinition();
  
  let body = document.body;
  
  let shelf = body.appendChild(document.createElement('div'));
  shelf.classList.add('shelf');
  
  let snacks = shelf.appendChild(document.createElement('div'));
  snacks.classList.add('snacks');
  
  let snackEntries = Object.entries(snackDef);
  for (const [ snackId, snackData ] of snackEntries) {
    
    let snack = snacks.appendChild(document.createElement('div'));
    snack.classList.add('snack');
    snack.classList.add(`snack-${snackId}`);
    
    let snackDisplay = snack.appendChild(document.createElement('div'));
    snackDisplay.classList.add('display');
    
  }
  
  console.log('Ready');
  
};
