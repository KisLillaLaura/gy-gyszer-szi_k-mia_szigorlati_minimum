// script.js

// Adatstruktúrák
const pharmacoGroups = [
    const pharmacoGroups = [
    "Major analgetikum",
    "Minor analgetikum",
    "NSAID",
    "Szedato-hipnotikum",
    "Lokális anesztetikum",
    "Antipszichotikum",
    "Antidepresszív szerek",
    "Antiepileptikum",
    "Paraszimpatomimetikum",
    "Paraszimpatolitikum",
    "Szimpatomimetikum",
    "Emésztőrendszerre ható szer",
    "Kardiotonikum",
    "Antiaritmiás szer",
    "Béta-blokkoló",
    "Antianginás szer",
    "Antikoaguláns",
    "Diuretikum",
    "Antidiabetikum",
    "Vitamin",
    "Antihisztamin",
    "Antihipertenzív szer",
    "Érelmeszesedés elleni szer",
    "Glükokortikoidok",
    "Nemi hormonok",
    "Antibakteriális és protozoon ellenes szerek",
    "Szulfonamid antibiotikumok",
    "Antibiotikum",
    "Antifungális szer",
    "Tetraciklin antibiotikum",
    "Aminoglikozid antibiotikum",
    "Béta-laktám antibiotikumok",
    "Vírusellenes szer",
    "Daganat ellenes szer"
];
];

let moleculesData = [];

// Fő függvények
function loadPharmacoGroups() {
    const container = document.getElementById('pharmGroups');
    pharmacoGroups.forEach(group => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `group-${group}`;
        checkbox.value = group;
        
        const label = document.createElement('label');
        label.htmlFor = `group-${group}`;
        label.textContent = group;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

function showPracticeSubmenu() {
    document.getElementById('practiceSubmenu').style.display = 'block';
}

function startQuiz() {
    startGame(getRandomMolecules(9));
}

function startPractice() {
    const selectedGroups = Array.from(document.querySelectorAll('#pharmGroups input:checked')).map(cb => cb.value);
    const count = parseInt(document.getElementById('moleculeCount').value);
    
    if (selectedGroups.length === 0) {
        alert('Válassz legalább egy hatástani csoportot!');
        return;
    }
    
    startGame(getMoleculesFromGroups(selectedGroups, count));
}

function startGame(molecules) {
    document.getElementById('practiceSubmenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    const container = document.getElementById('moleculeGrid');
    container.innerHTML = '';
    
    molecules.forEach(molecule => {
        const card = createMoleculeCard(molecule);
        container.appendChild(card);
    });
}

function createMoleculeCard(molecule) {
    const availableFields = [
        { key: 'latinName', label: 'Latin név', type: 'input' },
        { key: 'group', label: 'Hatástani csoport', type: 'select' },
        { key: 'subgroup', label: 'Alcsoport', type: 'select' },
        { key: 'target', label: 'Gyógyszeres célpont', type: 'select' },
        { key: 'generation', label: 'Generáció', type: 'input', optional: true }
    ];

    const fieldsToShow = availableFields.filter(field => {
        const value = molecule[field.key];
        return (value !== undefined && value !== null && value !== '') || !field.optional;
    });

    const colCount = fieldsToShow.length;
    const tableClass = `molecule-table molecule-table--${colCount}cols`;

    let tableHTML = `<table class="${tableClass}">`;
    
    fieldsToShow.forEach(field => {
        const value = molecule[field.key] || '';
        const isGeneration = field.key === 'generation';
        const rowClass = isGeneration ? 'generation-field' : '';
        
        tableHTML += `
            <tr class="${rowClass}">
                <th>${field.label}</th>
                <td data-label="${field.label}">
                    ${field.type === 'select' ? 
                        `<select class="${field.key}">
                            <option value="">Válassz...</option>
                            ${getOptionsForField(field.key)}
                        </select>` :
                        `<input type="text" class="${field.key}" value="${value}">`
                    }
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</table>';

    const card = document.createElement('div');
    card.className = 'molecule-card';
    
    const img = document.createElement('img');
    img.className = 'molecule-image';
    img.src = `molecules/${molecule.image}`;
    img.alt = molecule.name;
    
    const name = document.createElement('h3');
    name.className = 'molecule-card__title';
    name.textContent = molecule.name || 'Molekula';
    
    card.appendChild(img);
    card.appendChild(name);
    card.innerHTML += tableHTML;
    
    return card;
}

function checkAnswers() {
    alert('Válaszok ellenőrzése...');
}

function newGame() {
    if (document.getElementById('practiceSubmenu').style.display === 'block') {
        startPractice();
    } else {
        startQuiz();
    }
}

function backToMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('practiceSubmenu').style.display = 'none';
}

function getRandomMolecules(count) {
    if (moleculesData.length === 0) {
        console.error('Nincsenek betöltve molekula adatok');
        return [];
    }
    
    const shuffled = [...moleculesData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getMoleculesFromGroups(groups, count) {
    if (moleculesData.length === 0) {
        console.error('Nincsenek betöltve molekula adatok');
        return [];
    }
    
    const filtered = moleculesData.filter(molecule => 
        groups.includes(molecule.group)
    );
    
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getOptionsForField(field) {
    // Ez a függvény a legördülő menük opcióit generálja
    // Implementáld a saját igényeid szerint
    return '';
}

// JSON betöltése
async function loadMoleculesData() {
    try {
        const response = await fetch('molecules.json');
        if (!response.ok) {
            throw new Error('Hiba a JSON betöltésekor');
        }
        moleculesData = await response.json();
        console.log('Molekula adatok sikeresen betöltve', moleculesData);
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}

// Eseménykezelők beállítása
document.getElementById('quizBtn').addEventListener('click', startQuiz);
document.getElementById('practiceBtn').addEventListener('click', showPracticeSubmenu);
document.getElementById('startPracticeBtn').addEventListener('click', startPractice);
document.getElementById('checkAnswersBtn').addEventListener('click', checkAnswers);
document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('backToMenuBtn').addEventListener('click', backToMenu);

// Oldal betöltésekor
window.addEventListener('DOMContentLoaded', async () => {
    await loadMoleculesData();
    loadPharmacoGroups();
});
