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
  
  for (const [ snackId, snackData ] of Object.entries(snackDef)) {
    
    let snack = shelf.appendChild(document.createElement('div'));
    snack.classList.add('snack');
    snack.classList.add(`snack-${snackId}`);
    
    let snackTitle = snack.appendChild(document.createElement('div'));
    snackTitle.classList.add('title');
    snackTitle.innerContent = snackData.displayName;
    
  }
  
  console.log('Ready');
  
};
