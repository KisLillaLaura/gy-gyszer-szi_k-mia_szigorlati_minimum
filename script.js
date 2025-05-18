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
  const groupSet = new Set();
  molekulakData.forEach(mol => {
    mol.groups.forEach(group => groupSet.add(group));
  });

  const groupSelect = document.getElementById("groupSelect");
  groupSet.forEach(group => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });
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
  // ... [kép és latin név mező hozzáadása]

  // Hatástani csoport mező
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

  // Alcsoport mező
  const subgroupSelect = document.createElement("select");
  subgroupSelect.id = `${mode}_subgroup_${index}`;
  subgroupSelect.disabled = true;
  div.appendChild(subgroupSelect);

  // Target mező
  const targetSelect = document.createElement("select");
  targetSelect.id = `${mode}_target_${index}`;
  targetSelect.disabled = true;
  div.appendChild(targetSelect);

  // Generáció mező
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

  // Eseményfigyelő a hatástani csoport mezőre
  groupSelect.addEventListener("change", () => {
    const selectedGroup = groupSelect.value;

    // Alcsoportok frissítése
    const subgroups = [...new Set(molekulakData
      .filter(m => m.groups.includes(selectedGroup) && m.subgroup)
      .map(m => m.subgroup))];
    subgroupSelect.innerHTML = "";
    if (subgroups.length > 0) {
      subgroups.forEach(subgroup => {
        const option = document.createElement("option");
        option.value = subgroup;
        option.textContent = subgroup;
        subgroupSelect.appendChild(option);
      });
      subgroupSelect.disabled = false;
    } else {
      subgroupSelect.disabled = true;
    }

    // Targetek frissítése
    const targets = [...new Set(molekulakData
      .filter(m => m.groups.includes(selectedGroup) && m.target)
      .map(m => m.target))];
    targetSelect.innerHTML = "";
    if (targets.length > 0) {
      targets.forEach(target => {
        const option = document.createElement("option");
        option.value = target;
        option.textContent = target;
        targetSelect.appendChild(option);
      });
      targetSelect.disabled = false;
    } else {
      targetSelect.disabled = true;
    }
  });

  return div;
}

function generateSelect(options, id) {
  let html = `<select id="${id}">`;
  html += `<option value="">-- Válassz --</option>`;
  options.forEach(opt => {
    html += `<option value="${opt}">${opt}</option>`;
  });
  html += `</select>`;
  return html;
}

function getSubgroupsForGroup(group) {
  return ["vízoldható", "zsíroldható"]; // Példa, bővítsd, ha kell
}

function getTargetsForGroup(group) {
  return ["enzimek", "receptorok", "csatornák", "opioidreceptorok"]; // Példa, bővítsd
}

function getRandomElements(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
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
    const latin = document.getElementById(`beugro_latin_${index}`).value.trim();
    if (latin.toLowerCase() === mol.latinName.toLowerCase()) correct++;
    fields++;

    const group = document.getElementById(`beugro_group_${index}`).value;
    if (group === mol.groups[0]) correct++;
    fields++;

    if (mol.subgroup) {
      const val = document.getElementById(`beugro_subgroup_${index}`).value;
      if (val === mol.subgroup) correct++;
      fields++;
    }
    if (mol.target) {
      const val = document.getElementById(`beugro_target_${index}`).value;
      if (val === mol.target) correct++;
      fields++;
    }
    if (mol.generation) {
      const val = document.getElementById(`beugro_generation_${index}`).value;
      if (val === mol.generation) correct++;
      fields++;
    }

    score = correct / fields;
    totalScore += score;

    if (score < 1) {
      eredmenyDiv.innerHTML += `<p>${mol.name}: <b>${(score * 100).toFixed(1)}%</b><br>
      Hibás válasz. Helyes: ${mol.latinName}, ${mol.groups.join(", ")}${mol.subgroup ? ", " + mol.subgroup : ""}${mol.target ? ", " + mol.target : ""}${mol.generation ? ", " + mol.generation : ""}</p>`;
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
      eredmenyDiv.innerHTML += `<p>${mol.name}: Hibák → ${errors.join(", ")}</p>`;
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
}


