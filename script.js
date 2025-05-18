let molekulakData = [];
let beugroMolekulak = [];
let gyakorlasiMolekulak = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("gyogykemsumma_dict.json");
    molekulakData = await response.json();
    initializeGroupSelect();
    setupEventListeners();
  } catch (error) {
    console.error("Hiba a JSON betöltése során:", error);
  }
});

function initializeGroupSelect() {
  const groupSelect = document.getElementById("groupSelect");
  const uniqueGroups = new Set();

  molekulakData.forEach(mol => {
    mol.groups.forEach(group => uniqueGroups.add(group));
  });

  uniqueGroups.forEach(group => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });
}
function getRandomElements(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function setupEventListeners() {
  document.getElementById("beugroBtn").addEventListener("click", () => {
    document.getElementById("beugroContainer").style.display = "block";
    document.getElementById("gyakorlasContainer").style.display = "none";
    startBeugroMode();
  });

  document.getElementById("gyakorlasBtn").addEventListener("click", () => {
    document.getElementById("beugroContainer").style.display = "none";
    document.getElementById("gyakorlasContainer").style.display = "block";
  });

  document.getElementById("startGyakorlas").addEventListener("click", () => {
    startGyakorlasMode();
  });

  document.getElementById("submitBeugro").addEventListener("click", () => {
    evaluateBeugro();
  });

  document.getElementById("submitGyakorlas").addEventListener("click", () => {
    evaluateGyakorlas();
  });
}

function goBackToMenu() {
  document.getElementById("beugroContainer").style.display = "none";
  document.getElementById("gyakorlasContainer").style.display = "none";
  document.getElementById("beugroEredmeny").innerHTML = "";
  document.getElementById("gyakorlasEredmeny").innerHTML = "";
}
function startBeugroMode() {
  beugroMolekulak = getRandomElements(molekulakData, 9);
  const container = document.getElementById("beugroMolekulak");
  container.innerHTML = "";
  beugroMolekulak.forEach((mol, index) => {
    container.appendChild(createMolekulaForm(mol, index, "beugro"));
  });
}

function startGyakorlasMode() {
  const selectedGroups = Array.from(document.getElementById("groupSelect").selectedOptions).map(opt => opt.value);
  const count = parseInt(document.getElementById("gyakorlasCount").value, 10);

  if (!selectedGroups.length) {
    alert("Válassz ki legalább egy hatástani csoportot!");
    return;
  }

  const filtered = molekulakData.filter(mol => mol.groups.some(g => selectedGroups.includes(g)));
  gyakorlasiMolekulak = getRandomElements(filtered, count);
  const container = document.getElementById("gyakorlasMolekulak");
  container.innerHTML = "";
  gyakorlasiMolekulak.forEach((mol, index) => {
    container.appendChild(createMolekulaForm(mol, index, "gyakorlas"));
  });

  document.getElementById("submitGyakorlas").style.display = "block";
}

function createMolekulaForm(mol, index, mode) {
  const div = document.createElement("div");
  div.classList.add("molekula-form");
// Kép beszúrása
  if (mol.image) {
    const img = document.createElement("img");
    img.src = mol.image;  // Az elérési út a JSON-ből jön
    img.alt = mol.name;
    img.style.maxWidth = "200px";
    img.style.display = "block";
    div.appendChild(img);
  }

  // Latin név input
  const latinInput = document.createElement("input");
  latinInput.type = "text";
  latinInput.placeholder = "Latin név";
  latinInput.id = `${mode}_latin_${index}`;
  div.appendChild(latinInput);

  // Hatástani csoport select
  const groupSelect = document.createElement("select");
  groupSelect.id = `${mode}_group_${index}`;
  const uniqueGroups = [...new Set(molekulakData.flatMap(m => m.groups))];
  uniqueGroups.forEach(group => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });
  div.appendChild(groupSelect);

  // Alcsoport select
  const subgroupSelect = document.createElement("select");
  subgroupSelect.id = `${mode}_subgroup_${index}`;
  subgroupSelect.disabled = true;
  div.appendChild(subgroupSelect);

  // Target select
  const targetSelect = document.createElement("select");
  targetSelect.id = `${mode}_target_${index}`;
  targetSelect.disabled = true;
  div.appendChild(targetSelect);

  // Generáció (ha van)
  if (mol.generation) {
    const generationSelect = document.createElement("select");
    generationSelect.id = `${mode}_generation_${index}`;
    ["I.", "II.", "III."].forEach(gen => {
      const option = document.createElement("option");
      option.value = gen;
      option.textContent = gen;
      generationSelect.appendChild(option);
    });
    div.appendChild(generationSelect);
  }

  // Dinamikus alcsoport / target frissítés group select alapján
  groupSelect.addEventListener("change", () => {
    const selectedGroup = groupSelect.value;

    // Alcsoport frissítés
    const subgroups = [...new Set(molekulakData
      .filter(m => m.groups.includes(selectedGroup) && m.subgroup)
      .map(m => m.subgroup))];
    subgroupSelect.innerHTML = "";
    if (subgroups.length > 0) {
      subgroups.forEach(sub => {
        const opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subgroupSelect.appendChild(opt);
      });
      subgroupSelect.disabled = false;
    } else {
      subgroupSelect.disabled = true;
    }

    // Target frissítés
    const targets = [...new Set(molekulakData
      .filter(m => m.groups.includes(selectedGroup) && m.target)
      .map(m => m.target))];
    targetSelect.innerHTML = "";
    if (targets.length > 0) {
      targets.forEach(target => {
        const opt = document.createElement("option");
        opt.value = target;
        opt.textContent = target;
        targetSelect.appendChild(opt);
      });
      targetSelect.disabled = false;
    } else {
      targetSelect.disabled = true;
    }
  });

  return div;
}
function evaluateBeugro() {
  let totalScore = 0;
  const maxScore = beugroMolekulak.length;
  const eredmenyDiv = document.getElementById("beugroEredmeny");
  eredmenyDiv.innerHTML = "";

  beugroMolekulak.forEach((mol, index) => {
    let score = 0;
    let fields = 0;
    let correct = 0;
    const errors = [];

    const latin = document.getElementById(`beugro_latin_${index}`).value.trim();
    if (latin.toLowerCase() === mol.latinName.toLowerCase()) correct++; else errors.push(`Latin név: ${mol.latinName}`);
    fields++;

    const group = document.getElementById(`beugro_group_${index}`).value;
    if (group === mol.groups[0]) correct++; else errors.push(`Csoport: ${mol.groups[0]}`);
    fields++;

    if (mol.subgroup) {
      const val = document.getElementById(`beugro_subgroup_${index}`).value;
      if (val === mol.subgroup) correct++; else errors.push(`Alcsoport: ${mol.subgroup}`);
      fields++;
    }

    if (mol.target) {
      const val = document.getElementById(`beugro_target_${index}`).value;
      if (val === mol.target) correct++; else errors.push(`Target: ${mol.target}`);
      fields++;
    }

    if (mol.generation) {
      const val = document.getElementById(`beugro_generation_${index}`).value;
      if (val === mol.generation) correct++; else errors.push(`Generáció: ${mol.generation}`);
      fields++;
    }

    score = correct / fields;
    totalScore += score;

    if (score < 1) {
      eredmenyDiv.innerHTML += `<p><strong>${mol.name}</strong>: <b>${(score * 100).toFixed(1)}%</b><br>
        Hibás mezők → ${errors.join(", ")}</p>`;
    }
  });

  eredmenyDiv.innerHTML += `<h3>Összpontszám: ${totalScore.toFixed(2)} / ${maxScore}</h3>`;
}
function evaluateGyakorlas() {
  let total = 0;
  let correct = 0;
  const eredmenyDiv = document.getElementById("gyakorlasEredmeny");
  eredmenyDiv.innerHTML = "";

  gyakorlasiMolekulak.forEach((mol, index) => {
    const latin = document.getElementById(`gyakorlas_latin_${index}`).value.trim();
    const group = document.getElementById(`gyakorlas_group_${index}`).value;
    const subgroup = mol.subgroup ? document.getElementById(`gyakorlas_subgroup_${index}`).value : "";
    const target = mol.target ? document.getElementById(`gyakorlas_target_${index}`).value : "";
    const generation = mol.generation ? document.getElementById(`gyakorlas_generation_${index}`).value : "";

    let errors = [];

    if (latin.toLowerCase() === mol.latinName.toLowerCase()) correct++; else errors.push(`Latin név: ${mol.latinName}`);
    total++;

    if (group === mol.groups[0]) correct++; else errors.push(`Csoport: ${mol.groups[0]}`);
    total++;

    if (mol.subgroup) {
      if (subgroup === mol.subgroup) correct++; else errors.push(`Alcsoport: ${mol.subgroup}`);
      total++;
    }

    if (mol.target) {
      if (target === mol.target) correct++; else errors.push(`Target: ${mol.target}`);
      total++;
    }

    if (mol.generation) {
      if (generation === mol.generation) correct++; else errors.push(`Generáció: ${mol.generation}`);
      total++;
    }

    if (errors.length > 0) {
      eredmenyDiv.innerHTML += `<p><strong>${mol.name}</strong>: Hibás → ${errors.join(", ")}</p>`;
    }
  });

  const percent = ((correct / total) * 100).toFixed(1);
  eredmenyDiv.innerHTML += `<h3>Helyes válaszok aránya: ${percent}%</h3>`;
}
function goBackToMenu() {
  document.getElementById("beugroContainer").style.display = "none";
  document.getElementById("gyakorlasContainer").style.display = "none";
  document.getElementById("beugroEredmeny").innerHTML = "";
  document.getElementById("gyakorlasEredmeny").innerHTML = "";
  document.getElementById("gyakorlasMolekulak").innerHTML = "";
  document.getElementById("beugroMolekulak").innerHTML = "";
  document.getElementById("submitGyakorlas").style.display = "none";
}



