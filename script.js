let moleculesData = [];

fetch('gyogykemsumma_dict.json')
  .then(response => response.json())
  .then(data => {
    moleculesData = data.molekulak; 
    initializeGame();
  })
  .catch(error => console.error('Hiba a JSON betöltése során:', error));

function initializeGame() {
  let allGroups = [...new Set(moleculesData.map(m => m.csoport))];
  let groupSelectElem = document.getElementById('groupSelect');
  allGroups.forEach(group => {
    let option = document.createElement('option');
    option.value = group;
    option.textContent = group;
    groupSelectElem.appendChild(option);
  });

  document.getElementById('beugroBtn').addEventListener('click', () => {
    document.getElementById('beugroContainer').style.display = 'block';
    document.getElementById('gyakorlasContainer').style.display = 'none';
    startBeugro();
  });
  document.getElementById('gyakorlasBtn').addEventListener('click', () => {
    document.getElementById('gyakorlasContainer').style.display = 'block';
    document.getElementById('beugroContainer').style.display = 'none';
    document.getElementById('gyakorlasMolekulak').innerHTML = '';
    document.getElementById('gyakorlasEredmeny').innerHTML = '';
    document.getElementById('submitGyakorlas').style.display = 'none';
    document.getElementById('gyakorlasForm').style.display = 'block';
  });

  document.getElementById('startGyakorlas').addEventListener('click', (e) => {
    e.preventDefault();
    let groupSelect = document.getElementById('groupSelect');
    let chosenGroups = Array.from(groupSelect.selectedOptions).map(opt => opt.value);
    if (chosenGroups.length === 0) {
      alert('Legalább egy csoportot válassz ki!');
      return;
    }
    let count = parseInt(document.getElementById('gyakorlasCount').value);
    let available = moleculesData.filter(m => chosenGroups.includes(m.csoport));
    if (count < 1 || count > available.length) {
      alert('Érvénytelen darabszám.');
      return;
    }
    let selected = [];
    while (selected.length < count) {
      let mol = available[Math.floor(Math.random() * available.length)];
      if (!selected.includes(mol)) {
        selected.push(mol);
      }
    }
    let container = document.getElementById('gyakorlasMolekulak');
    container.innerHTML = '';
    selected.forEach((molecule, index) => {
      createMoleculeTable(molecule, index, 'gyakorlas');
    });
    document.getElementById('submitGyakorlas').style.display = 'inline-block';
    document.getElementById('gyakorlasForm').style.display = 'none';
  });

  document.getElementById('submitBeugro').addEventListener('click', () => {
    evaluate('beugro');
  });
  document.getElementById('submitGyakorlas').addEventListener('click', () => {
    evaluate('gyakorlas');
  });
}

function startBeugro() {
  let container = document.getElementById('beugroMolekulak');
  container.innerHTML = '';
  let selected = [];
  let groups = [...new Set(moleculesData.map(m => m.csoport))];
  while (selected.length < 9 && selected.length < moleculesData.length) {
    let group = groups[Math.floor(Math.random() * groups.length)];
    let mols = moleculesData.filter(m => m.csoport === group);
    if (mols.length === 0) continue;
    let mol = mols[Math.floor(Math.random() * mols.length)];
    if (!selected.includes(mol)) {
      selected.push(mol);
    }
  }
  while (selected.length < 9) {
    let mol = moleculesData[Math.floor(Math.random() * moleculesData.length)];
    if (!selected.includes(mol)) {
      selected.push(mol);
    }
  }
  selected.forEach((molecule, index) => {
    createMoleculeTable(molecule, index, 'beugro');
  });
}

function createMoleculeTable(molecule, index, mode) {
  let table = document.createElement('table');
  let headerRow = table.insertRow();
  ['Kép', 'Latin név', 'Hatástani csoport', 'Alcsoport', 'Céltárgy', 'Generáció'].forEach(text => {
    let th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  let row = table.insertRow();
  // Kép
  let imgTd = row.insertCell();
  let img = document.createElement('img');
  img.src = 'molekulak/' + molecule.image;
  img.alt = molecule.latin;
  img.width = 100;
  imgTd.appendChild(img);
  // Latin név
  let latinTd = row.insertCell();
  let latinInput = document.createElement('input');
  latinInput.type = 'text';
  latinInput.id = mode + '-latin-' + index;
  latinTd.appendChild(latinInput);
  // Csoport
  let groupTd = row.insertCell();
  let groupSelect = document.createElement('select');
  groupSelect.id = mode + '-group-' + index;
  let emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = 'Válassz...';
  groupSelect.appendChild(emptyOpt);
  let uniqueGroups = [...new Set(moleculesData.map(m => m.csoport))];
  uniqueGroups.forEach(g => {
    let opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    groupSelect.appendChild(opt);
  });
  groupTd.appendChild(groupSelect);
  // Alcsoport
  let subTd = row.insertCell();
  let subSelect = document.createElement('select');
  subSelect.id = mode + '-sub-' + index;
  subSelect.disabled = true;
  subTd.appendChild(subSelect);
  // Céltárgy
  let targetTd = row.insertCell();
  let targetSelect = document.createElement('select');
  targetSelect.id = mode + '-target-' + index;
  targetSelect.disabled = true;
  targetTd.appendChild(targetSelect);
  // Generáció
  let genTd = row.insertCell();
  let genSelect = document.createElement('select');
  genSelect.id = mode + '-gen-' + index;
  genSelect.disabled = true;
  ['I.', 'II.', 'III.'].forEach(gen => {
    let opt = document.createElement('option');
    opt.value = gen;
    opt.textContent = gen;
    genSelect.appendChild(opt);
  });
  genTd.appendChild(genSelect);

  function updateDependent() {
    if (latinInput.value.trim() !== '' && groupSelect.value !== '') {
      let relevant = moleculesData.filter(m => m.csoport === groupSelect.value);
      let subs = [...new Set(relevant.map(m => m.alcsoport).filter(v => v))];
      subSelect.innerHTML = '';
      if (subs.length > 0) {
        subs.forEach(sval => {
          let opt = document.createElement('option');
          opt.value = sval;
          opt.textContent = sval;
          subSelect.appendChild(opt);
        });
        subSelect.disabled = false;
      } else {
        subSelect.disabled = true;
      }
      let targets = [...new Set(relevant.map(m => m.target).filter(v => v))];
      targetSelect.innerHTML = '';
      if (targets.length > 0) {
        targets.forEach(tval => {
          let opt = document.createElement('option');
          opt.value = tval;
          opt.textContent = tval;
          targetSelect.appendChild(opt);
        });
        targetSelect.disabled = false;
      } else {
        targetSelect.disabled = true;
      }
      let gens = [...new Set(relevant.map(m => m.generacio).filter(v => v))];
      if (gens.length > 0) {
        genSelect.disabled = false;
      } else {
        genSelect.disabled = true;
      }
    }
  }
  latinInput.addEventListener('input', updateDependent);
  groupSelect.addEventListener('change', updateDependent);

  if (mode === 'beugro') {
    document.getElementById('beugroMolekulak').appendChild(table);
  } else {
    document.getElementById('gyakorlasMolekulak').appendChild(table);
  }
}

function evaluate(mode) {
  let tablesContainer = (mode === 'beugro') ? 
    document.getElementById('beugroMolekulak') : 
    document.getElementById('gyakorlasMolekulak');
  let tables = tablesContainer.getElementsByTagName('table');
  let correctCount = 0;
  let total = tables.length;

  for (let idx = 0; idx < total; idx++) {
    let latinInput = document.getElementById(mode + '-latin-' + idx);
    let groupSelect = document.getElementById(mode + '-group-' + idx);
    let subSelect = document.getElementById(mode + '-sub-' + idx);
    let targetSelect = document.getElementById(mode + '-target-' + idx);
    let genSelect = document.getElementById(mode + '-gen-' + idx);
    // Helyes molekula megkeresése a beolvasott adatok között
    // Feltételezzük, hogy az egyedi azonosítót (latin+csoport) ismerjük:
    let chosenLatin = latinInput.value.trim().toLowerCase();
    let chosenGroup = groupSelect.value;
    let correctMol = moleculesData.find(m =>
      m.latin.toLowerCase() === chosenLatin && m.csoport === chosenGroup
    );
    if (!correctMol) {
      // Ha nem találjuk, akkor biztos, hogy hibás, de folytatjuk
      correctMol = { latin: '', csoport: '', alcsoport: '', target: '', generacio: '' };
    }
    let points = 0;
    let totalFields = 2;
    if (latinInput.value.trim().toLowerCase() === correctMol.latin.toLowerCase()) points++;
    if (groupSelect.value === correctMol.csoport) points++;
    if (!subSelect.disabled) {
      totalFields++;
      if (subSelect.value === correctMol.alcsoport) points++;
    }
    if (!targetSelect.disabled) {
      totalFields++;
      if (targetSelect.value === correctMol.target) points++;
    }
    if (!genSelect.disabled) {
      totalFields++;
      if (genSelect.value === correctMol.generacio) points++;
    }
    if (points === totalFields) {
      correctCount++;
    } else {
      // Hibás: mutassuk a helyes megoldást
      let helyes = `Helyes megoldás: Latin név – ${correctMol.latin}, Csoport – ${correctMol.csoport}`;
      if (correctMol.alcsoport) helyes += `, Alcsoport – ${correctMol.alcsoport}`;
      if (correctMol.target) helyes += `, Céltárgy – ${correctMol.target}`;
      if (correctMol.generacio) helyes += `, Generáció – ${correctMol.generacio}`;
      let p = document.createElement('p');
      p.textContent = helyes;
      tables[idx].appendChild(p);
    }
  }
  if (mode === 'beugro') {
    let eredDiv = document.getElementById('beugroEredmeny');
    eredDiv.textContent = `Összpontszám: ${correctCount}/${total}`;
  } else {
    let eredDiv = document.getElementById('gyakorlasEredmeny');
    let perc = Math.round((correctCount / total) * 100);
    eredDiv.textContent = `Helyes válaszok: ${perc}% (${correctCount}/${total})`;
  }
}
