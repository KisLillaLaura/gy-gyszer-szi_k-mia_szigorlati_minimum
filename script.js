// script.js - Javított változat

// Adatstruktúrák
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

let moleculesData = [];

async function loadMoleculesData() {
    try {
        const response = await fetch('molekulak.json');
        if (!response.ok) {
            throw new Error('Hiba a JSON betöltésekor');
        }
        moleculesData = await response.json();
        console.log('Molekula adatok sikeresen betöltve', moleculesData);
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}

function loadPharmacoGroups() {
    const container = document.getElementById('pharmGroups');
    container.innerHTML = '';
    
    pharmacoGroups.forEach(group => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `group-${group.replace(/\s+/g, '-').toLowerCase()}`;
        input.value = group;
        
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = group;
        
        div.appendChild(input);
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
        { 
            key: 'groups', 
            label: 'Hatástani csoport(ok)', 
            type: 'select',
            options: pharmacoGroups
        },
        { key: 'subgroup', label: 'Alcsoport', type: 'input' },
        { key: 'target', label: 'Gyógyszeres célpont', type: 'input' },
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
                            ${getOptionsForField(field)}
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
    img.onerror = function() {
        this.src = 'placeholder.png';
    };
    
    const name = document.createElement('h3');
    name.className = 'molecule-card__title';
    name.textContent = molecule.name || 'Molekula';
    
    card.appendChild(img);
    card.appendChild(name);
    card.innerHTML += tableHTML;
    
    return card;
}

function getOptionsForField(field) {
    if (!field.options) return '';
    
    return field.options.map(option => 
        `<option value="${option}">${option}</option>`
    ).join('');
}

function checkAnswers() {
    const cards = document.querySelectorAll('.molecule-card');
    let correctCount = 0;
    let totalCount = 0;

    cards.forEach(card => {
        const moleculeName = card.querySelector('.molecule-card__title').textContent;
        const molecule = moleculesData.find(m => m.name === moleculeName);
        
        if (!molecule) return;

        const inputs = card.querySelectorAll('input, select');
        inputs.forEach(input => {
            const field = input.classList[0];
            const userValue = input.value.trim();
            const correctValue = molecule[field];
            
            totalCount++;
            
            if (Array.isArray(correctValue)) {
                if (correctValue.includes(userValue)) {
                    input.classList.add('valid');
                    input.classList.remove('invalid');
                    correctCount++;
                } else {
                    input.classList.add('invalid');
                    input.classList.remove('valid');
                }
            } else if (userValue === correctValue) {
                input.classList.add('valid');
                input.classList.remove('invalid');
                correctCount++;
            } else {
                input.classList.add('invalid');
                input.classList.remove('valid');
            }
        });
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.className = score >= 70 ? 'score-display score-display--success' : 'score-display score-display--warning';
    scoreDisplay.textContent = `Eredmény: ${score}% (${correctCount}/${totalCount})`;
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
        molecule.groups && molecule.groups.some(group => groups.includes(group))
    );
    
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Eseménykezelők beállítása
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('quizBtn').addEventListener('click', startQuiz);
    document.getElementById('practiceBtn').addEventListener('click', showPracticeSubmenu);
    document.getElementById('startPracticeBtn').addEventListener('click', startPractice);
    document.getElementById('checkAnswersBtn').addEventListener('click', checkAnswers);
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('backToMenuBtn').addEventListener('click', backToMenu);

    await loadMoleculesData();
    loadPharmacoGroups();
    document.getElementById('maxMolecules').textContent = moleculesData.length;
});
