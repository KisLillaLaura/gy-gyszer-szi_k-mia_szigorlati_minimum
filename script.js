// game.js

let molecules = [];
let uniqueGroups = new Set();
let uniqueSubgroups = new Set();
let uniqueTargets = new Set();
const generations = ["I.", "II.", "III."];

// JSON betöltése és előkészítés
fetch('gyogykemsumma_dict.json')
  .then(response => response.json())
  .then(data => {
    molecules = data;
    // Különböző opciók kigyűjtése
    molecules.forEach(mol => {
      mol.groups.forEach(g => uniqueGroups.add(g));
      if (mol.subgroup) uniqueSubgroups.add(mol.subgroup);
      if (mol.target) uniqueTargets.add(mol.target);
    });
    // Gombok eseménykezelői
    document.getElementById('beugroBtn').addEventListener('click', renderBeugro);
    document.getElementById('gyakorBtn').addEventListener('click', renderGyakorSelect);
  })
  .catch(err => console.error('JSON betöltési hiba:', err));

/* ===================== BEUGRÓ MÓD ===================== */
function renderBeugro() {
  const container = document.getElementById('jatek');
  container.innerHTML = '';  // Tisztítás
  const selectedMols = shuffle([...molecules]).slice(0, 9); // Véletlenszerű 9 molekula

  // 9 dinamikus tábla létrehozása molekulánként
  selectedMols.forEach((mol, idx) => {
    const div = document.createElement('div');
    div.className = 'molecule';
    // Kép
    const img = document.createElement('img');
    img.src = 'molekulak/' + mol.image;
    img.alt = mol.name;
    div.appendChild(img);
    // Táblázat
    const table = document.createElement('table');
    // Latin név
    const rowLatin = table.insertRow();
    rowLatin.insertCell(0).outerHTML = '<th>Latin név:</th>';
    rowLatin.insertCell(1).innerHTML = `<input type="text" id="latin_${idx}">`;
    // Hatástani csoport
    if (mol.groups.length) {
      const rowGroup = table.insertRow();
      rowGroup.insertCell(0).outerHTML = '<th>Hatástani csoport:</th>';
      const select = document.createElement('select');
      select.id = `group_${idx}`;
      select.innerHTML = '<option value="">- válassz -</option>';
      uniqueGroups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        select.appendChild(opt);
      });
      rowGroup.insertCell(1).appendChild(select);
    }
    // Alcsoport
    if (mol.subgroup) {
      const rowSub = table.insertRow();
      rowSub.insertCell(0).outerHTML = '<th>Alcsoport:</th>';
      const select = document.createElement('select');
      select.id = `subgroup_${idx}`;
      select.innerHTML = '<option value="">- válassz -</option>';
      uniqueSubgroups.forEach(sg => {
        const opt = document.createElement('option');
        opt.value = sg;
        opt.textContent = sg;
        select.appendChild(opt);
      });
      rowSub.insertCell(1).appendChild(select);
    }
    // Target
    if (mol.target) {
      const rowTarget = table.insertRow();
      rowTarget.insertCell(0).outerHTML = '<th>Célfehérje:</th>';
      const select = document.createElement('select');
      select.id = `target_${idx}`;
      select.innerHTML = '<option value="">- válassz -</option>';
      uniqueTargets.forEach(tar => {
        const opt = document.createElement('option');
        opt.value = tar;
        opt.textContent = tar;
        select.appendChild(opt);
      });
      rowTarget.insertCell(1).appendChild(select);
    }
    // Generáció
    if (mol.generation) {
      const rowGen = table.insertRow();
      rowGen.insertCell(0).outerHTML = '<th>Generáció:</th>';
      const select = document.createElement('select');
      select.id = `gen_${idx}`;
      select.innerHTML = '<option value="">- válassz -</option>';
      generations.forEach(gen => {
        const opt = document.createElement('option');
        opt.value = gen;
        opt.textContent = gen;
        select.appendChild(opt);
      });
      rowGen.insertCell(1).appendChild(select);
    }
    div.appendChild(table);
    container.appendChild(div);
  });

  // Ellenőrzés gomb és pontszám kiírás
  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Ellenőrzés';
  checkBtn.addEventListener('click', () => {
    let totalScore = 0;
    selectedMols.forEach((mol, idx) => {
      let correctCount = 0;
      let fields = 1; // Latin név mindig van
      const latinInput = document.getElementById(`latin_${idx}`);
      if (latinInput.value.trim() === mol.latinName) {
        correctCount++;
      } else {
        latinInput.classList.add('incorrect');
      }
      // Hatástani csoport
      if (mol.groups.length) {
        fields++;
        const sel = document.getElementById(`group_${idx}`);
        if (sel.value === mol.groups[0]) {
          correctCount++;
        } else {
          sel.classList.add('incorrect');
        }
      }
      // Alcsoport
      if (mol.subgroup) {
        fields++;
        const sel = document.getElementById(`subgroup_${idx}`);
        if (sel.value === mol.subgroup) {
          correctCount++;
        } else {
          sel.classList.add('incorrect');
        }
      }
      // Target
      if (mol.target) {
        fields++;
        const sel = document.getElementById(`target_${idx}`);
        if (sel.value === mol.target) {
          correctCount++;
        } else {
          sel.classList.add('incorrect');
        }
      }
      // Generáció
      if (mol.generation) {
        fields++;
        const sel = document.getElementById(`gen_${idx}`);
        if (sel.value === mol.generation) {
          correctCount++;
        } else {
          sel.classList.add('incorrect');
        }
      }
      // Pontozás: ha minden helyes, 1 pont; ha latin+group helyes és van több mező, részpont
      let score = 0;
      if (correctCount === fields) {
        score = 1;
      } else if (correctCount === 2 && fields > 2) {
        score = 2 / fields;  // pl. 2/3 = 0.667 vagy 2/4 = 0.5
      }
      totalScore += score;
      // Hibás válaszoknál megmutatjuk a helyes választ
      const parentDiv = document.getElementById('jatek');
      const info = document.createElement('p');
      info.innerHTML = `(${mol.name} helyes megoldásai: Latin név = <span class="correct">${mol.latinName}</span>` +
        `${mol.groups.length ? `, Csoport = <span class="correct">${mol.groups[0]}</span>` : ''}` +
        `${mol.subgroup ? `, Alcsoport = <span class="correct">${mol.subgroup}</span>` : ''}` +
        `${mol.target ? `, Cél = <span class="correct">${mol.target}</span>` : ''}` +
        `${mol.generation ? `, Generáció = <span class="correct">${mol.generation}</span>` : ''})`;
      parentDiv.appendChild(info);
    });
    // Összpontszám megjelenítése
    const result = document.createElement('h3');
    result.textContent = `Összpontszám: ${totalScore.toFixed(2)}`;
    container.appendChild(result);
  });
  container.appendChild(checkBtn);
}

/* ===================== GYAKORLÁS MÓD ===================== */
function renderGyakorSelect() {
  const container = document.getElementById('jatek');
  container.innerHTML = '';

  // Választható csoportok jelölőnégyzetekkel
  const form = document.createElement('div');
  form.innerHTML = '<h2>Gyakorlás: válassz hatástani csoportokat és darabszámot</h2>';
  uniqueGroups.forEach(g => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${g}"> ${g}<br>`;
    form.appendChild(label);
  });
  // Darabszám mező
  const numInput = document.createElement('input');
  numInput.type = 'number';
  numInput.id = 'gyakorCount';
  numInput.value = 3;
  numInput.min = 1;
  numInput.max = molecules.length;
  const numLabel = document.createElement('div');
  numLabel.textContent = 'Molekulák száma: ';
  numLabel.appendChild(numInput);
  form.appendChild(numLabel);
  // Indító gomb
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Gyakorlás indítása';
  startBtn.addEventListener('click', startGyakor);
  form.appendChild(startBtn);
  container.appendChild(form);
}

let practiceList = [];
let currentIdx = 0;
let correctAnswers = 0;

function startGyakor() {
  // Kiválasztott csoportok lekérdezése
  const checked = Array.from(document.querySelectorAll('#jatek input[type="checkbox"]:checked'))
                       .map(cb => cb.value);
  const count = parseInt(document.getElementById('gyakorCount').value) || 1;
  // Szűrés a kiválasztott csoportokra
  const filtered = molecules.filter(mol => {
    return mol.groups.some(g => checked.includes(g));
  });
  // Véletlenszerű lista összeállítása
  practiceList = shuffle(filtered).slice(0, count);
  currentIdx = 0;
  correctAnswers = 0;
  // Első kérdés megjelenítése
  renderNextQuestion();
}

function renderNextQuestion() {
  const container = document.getElementById('jatek');
  container.innerHTML = '';
  if (currentIdx >= practiceList.length) {
    // Végeredmény
    const percent = (correctAnswers / practiceList.length * 100).toFixed(1);
    container.innerHTML = `<h2>Végeredmény: ${percent}%</h2>`;
    return;
  }
  const mol = practiceList[currentIdx];
  const div = document.createElement('div');
  div.className = 'molecule';
  // Kép
  const img = document.createElement('img');
  img.src = 'molekulak/' + mol.image;
  img.alt = mol.name;
  div.appendChild(img);
  // Táblázat (ugyanúgy mint Beugró módban)
  const table = document.createElement('table');
  // Latin név
  const rowLatin = table.insertRow();
  rowLatin.insertCell(0).outerHTML = '<th>Latin név:</th>';
  rowLatin.insertCell(1).innerHTML = `<input type="text" id="latin_g">`;
  // Hatástani csoport
  if (mol.groups.length) {
    const rowGroup = table.insertRow();
    rowGroup.insertCell(0).outerHTML = '<th>Hatástani csoport:</th>';
    const select = document.createElement('select');
    select.id = 'group_g';
    select.innerHTML = '<option value="">- válassz -</option>';
    uniqueGroups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      select.appendChild(opt);
    });
    rowGroup.insertCell(1).appendChild(select);
  }
  // Alcsoport
  if (mol.subgroup) {
    const rowSub = table.insertRow();
    rowSub.insertCell(0).outerHTML = '<th>Alcsoport:</th>';
    const select = document.createElement('select');
    select.id = 'subgroup_g';
    select.innerHTML = '<option value="">- válassz -</option>';
    uniqueSubgroups.forEach(sg => {
      const opt = document.createElement('option');
      opt.value = sg;
      opt.textContent = sg;
      select.appendChild(opt);
    });
    rowSub.insertCell(1).appendChild(select);
  }
  // Target
  if (mol.target) {
    const rowTarget = table.insertRow();
    rowTarget.insertCell(0).outerHTML = '<th>Célfehérje:</th>';
    const select = document.createElement('select');
    select.id = 'target_g';
    select.innerHTML = '<option value="">- válassz -</option>';
    uniqueTargets.forEach(tar => {
      const opt = document.createElement('option');
      opt.value = tar;
      opt.textContent = tar;
      select.appendChild(opt);
    });
    rowTarget.insertCell(1).appendChild(select);
  }
  // Generáció
  if (mol.generation) {
    const rowGen = table.insertRow();
    rowGen.insertCell(0).outerHTML = '<th>Generáció:</th>';
    const select = document.createElement('select');
    select.id = 'gen_g';
    select.innerHTML = '<option value="">- válassz -</option>';
    generations.forEach(gen => {
      const opt = document.createElement('option');
      opt.value = gen;
      opt.textContent = gen;
      select.appendChild(opt);
    });
    rowGen.insertCell(1).appendChild(select);
  }
  div.appendChild(table);
  container.appendChild(div);

  // Ellenőrzés és visszajelzés
  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Ellenőrzés';
  checkBtn.addEventListener('click', () => {
    let allCorrect = true;
    // Latin név
    const latinInput = document.getElementById('latin_g');
    if (latinInput.value.trim() === mol.latinName) {
      latinInput.classList.add('correct');
      correctAnswers++;
    } else {
      latinInput.classList.add('incorrect');
      allCorrect = false;
    }
    // Hatástani csoport
    if (mol.groups.length) {
      const sel = document.getElementById('group_g');
      if (sel.value === mol.groups[0]) {
        sel.classList.add('correct');
      } else {
        sel.classList.add('incorrect');
        allCorrect = false;
      }
    }
    // Alcsoport
    if (mol.subgroup) {
      const sel = document.getElementById('subgroup_g');
      if (sel.value === mol.subgroup) {
        sel.classList.add('correct');
      } else {
        sel.classList.add('incorrect');
        allCorrect = false;
      }
    }
    // Target
    if (mol.target) {
      const sel = document.getElementById('target_g');
      if (sel.value === mol.target) {
        sel.classList.add('correct');
      } else {
        sel.classList.add('incorrect');
        allCorrect = false;
      }
    }
    // Generáció
    if (mol.generation) {
      const sel = document.getElementById('gen_g');
      if (sel.value === mol.generation) {
        sel.classList.add('correct');
      } else {
        sel.classList.add('incorrect');
        allCorrect = false;
      }
    }
    // Ha minden helyes, növeljük a helyes válaszok számlálót
    if (!allCorrect) {
      // Hibás válasznál megjelenítjük a helyes megoldást
      const info = document.createElement('p');
      info.innerHTML = `<span class="incorrect">Helytelen. </span> Helyes megoldás: Latin név = <span class="correct">${mol.latinName}</span>` +
        `${mol.groups.length ? `, Csoport = <span class="correct">${mol.groups[0]}</span>` : ''}` +
        `${mol.subgroup ? `, Alcsoport = <span class="correct">${mol.subgroup}</span>` : ''}` +
        `${mol.target ? `, Cél = <span class="correct">${mol.target}</span>` : ''}` +
        `${mol.generation ? `, Generáció = <span class="correct">${mol.generation}</span>` : ''}.`;
      container.appendChild(info);
    }
    // Következő kérdés gomb
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Következő';
    nextBtn.addEventListener('click', () => {
      currentIdx++;
      renderNextQuestion();
    });
    container.appendChild(nextBtn);
  });
  container.appendChild(checkBtn);
}

// Segédfüggvény: tömb véletlenszerű elegyítése
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // Csere
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

