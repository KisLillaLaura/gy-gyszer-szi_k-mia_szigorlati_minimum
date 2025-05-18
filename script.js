// game.js

// Globális változók
let molekulakData = []; // Molekulák adatai a JSON-ból
let hatastaniCsoportok = new Set();
let alcsoportok = new Set();
let targetek = new Set();
let generaciok = new Set();

// Gyakorlás mód állapota
let practiceQuestions = [];
let currentIndex = 0;
let correctCount = 0;

window.onload = function() {
    // JSON betöltése
    fetch('gyogykemsumma_dict.json')
        .then(response => response.json())
        .then(data => {
            molekulakData = data;
            // Kiválasztható opciók összegyűjtése (hatástani csoportok, alcsoportok, targetek, generációk)
            molekulakData.forEach(mol => {
                if (mol.hatastani_csoport) hatastaniCsoportok.add(mol.hatastani_csoport);
                if (mol.alcsoport) alcsoportok.add(mol.alcsoport);
                if (mol.target) targetek.add(mol.target);
                if (mol.generacio) generaciok.add(mol.generacio);
            });
        })
        .catch(error => console.error('Hiba a JSON betöltésekor:', error));

    // Eseménykezelők gombokhoz
    document.getElementById('beugroBtn').addEventListener('click', beugroMode);
    document.getElementById('gyakBtn').addEventListener('click', gyakorlasMode);
};

// **Beugró mód inicializálása**
function beugroMode() {
    const jatekDiv = document.getElementById('jatek');
    jatekDiv.innerHTML = ''; // Korábbi tartalom törlése

    // Véletlenszerűen kiválaszt 9 különböző molekulát
    const shuffled = molekulakData.slice().sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 9);

    // Táblázat létrehozása
    const table = document.createElement('table');
    table.id = 'beugroTable';

    // Fejléc létrehozása
    const header = document.createElement('tr');
    const fejlecCimkek = ['Kép', 'Latin név', 'Hatástani csoport', 'Alcsoport', 'Target', 'Generáció'];
    fejlecCimkek.forEach(cim => {
        const th = document.createElement('th');
        th.innerText = cim;
        header.appendChild(th);
    });
    table.appendChild(header);

    // Minden kiválasztott molekulához egy-egy sor létrehozása
    selected.forEach((mol, index) => {
        const row = document.createElement('tr');

        // Kép megjelenítése
        const imgTd = document.createElement('td');
        if (mol.kep) {
            const img = document.createElement('img');
            img.src = 'molekulak/' + mol.kep;
            img.alt = mol.latin;
            img.style.width = '100px';
            imgTd.appendChild(img);
        }
        row.appendChild(imgTd);

        // Latin név (felhasználói bevitel)
        const latinTd = document.createElement('td');
        const latinInput = document.createElement('input');
        latinInput.type = 'text';
        latinInput.id = `latin_${index}`;
        latinInput.placeholder = 'Latin név';
        latinTd.appendChild(latinInput);
        row.appendChild(latinTd);

        // Hatástani csoport (legördülő)
        const csoportTd = document.createElement('td');
        if (mol.hatastani_csoport) {
            const csoportSelect = document.createElement('select');
            csoportSelect.id = `csoport_${index}`;
            // üres opció
            let opt = document.createElement('option');
            opt.value = '';
            opt.innerText = '';
            csoportSelect.appendChild(opt);
            // Opciók hozzáadása
            hatastaniCsoportok.forEach(csoport => {
                const option = document.createElement('option');
                option.value = csoport;
                option.innerText = csoport;
                csoportSelect.appendChild(option);
            });
            csoportTd.appendChild(csoportSelect);
        }
        row.appendChild(csoportTd);

        // Alcsoport (legördülő)
        const alcsoportTd = document.createElement('td');
        if (mol.alcsoport) {
            const alcsoportSelect = document.createElement('select');
            alcsoportSelect.id = `alcsoport_${index}`;
            let opt = document.createElement('option');
            opt.value = '';
            opt.innerText = '';
            alcsoportSelect.appendChild(opt);
            alcsoportok.forEach(a => {
                const option = document.createElement('option');
                option.value = a;
                option.innerText = a;
                alcsoportSelect.appendChild(option);
            });
            alcsoportTd.appendChild(alcsoportSelect);
        }
        row.appendChild(alcsoportTd);

        // Target (legördülő)
        const targetTd = document.createElement('td');
        if (mol.target) {
            const targetSelect = document.createElement('select');
            targetSelect.id = `target_${index}`;
            let opt = document.createElement('option');
            opt.value = '';
            opt.innerText = '';
            targetSelect.appendChild(opt);
            targetek.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.innerText = t;
                targetSelect.appendChild(option);
            });
            targetTd.appendChild(targetSelect);
        }
        row.appendChild(targetTd);

        // Generáció (legördülő)
        const genTd = document.createElement('td');
        if (mol.generacio) {
            const genSelect = document.createElement('select');
            genSelect.id = `generacio_${index}`;
            let opt = document.createElement('option');
            opt.value = '';
            opt.innerText = '';
            genSelect.appendChild(opt);
            generaciok.forEach(g => {
                const option = document.createElement('option');
                option.value = g;
                option.innerText = g;
                genSelect.appendChild(option);
            });
            genTd.appendChild(genSelect);
        }
        row.appendChild(genTd);

        table.appendChild(row);
    });

    jatekDiv.appendChild(table);

    // Ellenőrzés gomb a táblázat után
    const checkBtn = document.createElement('button');
    checkBtn.id = 'beugroCheck';
    checkBtn.innerText = 'Ellenőrzés';
    jatekDiv.appendChild(checkBtn);

    // Ellenőrzés kattintáskor
    checkBtn.addEventListener('click', function() {
        let totalScore = 0;
        selected.forEach((mol, index) => {
            let rowScore = 0;
            const latinInput = document.getElementById(`latin_${index}`);
            const userLatin = latinInput.value.trim();
            const correctLatin = mol.latin;

            // Latin név ellenőrzése
            let latinOK = false;
            if (userLatin.toLowerCase() === correctLatin.toLowerCase()) {
                latinOK = true;
                latinInput.style.backgroundColor = '#c8e6c9'; // világos zöld
            } else {
                latinInput.style.backgroundColor = '#ffcdd2'; // világos piros
                const hint = document.createElement('div');
                hint.innerText = 'Helyes latin: ' + correctLatin;
                hint.style.color = 'green';
                latinInput.parentNode.appendChild(hint);
            }

            // Hatástani csoport ellenőrzése
            let csoportOK = false;
            if (mol.hatastani_csoport) {
                const csoportSelect = document.getElementById(`csoport_${index}`);
                const userCsoport = csoportSelect.value;
                if (userCsoport === mol.hatastani_csoport) {
                    csoportOK = true;
                    csoportSelect.style.backgroundColor = '#c8e6c9';
                } else {
                    csoportSelect.style.backgroundColor = '#ffcdd2';
                    const hint = document.createElement('div');
                    hint.innerText = 'Helyes csoport: ' + mol.hatastani_csoport;
                    hint.style.color = 'green';
                    csoportSelect.parentNode.appendChild(hint);
                }
            } else {
                // Ha nincs ilyen mező, akkor automatikusan teljesül
                csoportOK = true;
            }

            // Alcsoport ellenőrzése
            let alcsoportOK = false;
            if (mol.alcsoport) {
                const alcSelect = document.getElementById(`alcsoport_${index}`);
                const userA = alcSelect.value;
                if (userA === mol.alcsoport) {
                    alcsoportOK = true;
                    alcSelect.style.backgroundColor = '#c8e6c9';
                } else {
                    alcSelect.style.backgroundColor = '#ffcdd2';
                    const hint = document.createElement('div');
                    hint.innerText = 'Helyes alcsoport: ' + mol.alcsoport;
                    hint.style.color = 'green';
                    alcSelect.parentNode.appendChild(hint);
                }
            } else {
                alcsoportOK = true;
            }

            // Target ellenőrzése
            let targetOK = false;
            if (mol.target) {
                const tarSelect = document.getElementById(`target_${index}`);
                const userT = tarSelect.value;
                if (userT === mol.target) {
                    targetOK = true;
                    tarSelect.style.backgroundColor = '#c8e6c9';
                } else {
                    tarSelect.style.backgroundColor = '#ffcdd2';
                    const hint = document.createElement('div');
                    hint.innerText = 'Helyes target: ' + mol.target;
                    hint.style.color = 'green';
                    tarSelect.parentNode.appendChild(hint);
                }
            } else {
                targetOK = true;
            }

            // Generáció ellenőrzése
            let genOK = false;
            if (mol.generacio) {
                const genSelect = document.getElementById(`generacio_${index}`);
                const userG = genSelect.value;
                if (userG === mol.generacio) {
                    genOK = true;
                    genSelect.style.backgroundColor = '#c8e6c9';
                } else {
                    genSelect.style.backgroundColor = '#ffcdd2';
                    const hint = document.createElement('div');
                    hint.innerText = 'Helyes generáció: ' + mol.generacio;
                    hint.style.color = 'green';
                    genSelect.parentNode.appendChild(hint);
                }
            } else {
                genOK = true;
            }

            // **Pontozás:**
            // Teljes találat esetén 1 pont
            if (latinOK && csoportOK && alcsoportOK && targetOK && genOK) {
                rowScore = 1;
            }
            // Csak latin név + csoport helyes -> részpont
            else if (latinOK && csoportOK) {
                // Számoljuk a nem üres mezők számát (latin + csoport mindig van)
                let totalFields = 2;
                if (mol.alcsoport) totalFields++;
                if (mol.target) totalFields++;
                if (mol.generacio) totalFields++;
                if (totalFields === 3) rowScore = 0.667;
                else rowScore = 0.5;
            }
            totalScore += rowScore;
        });

        // Pontszám kiírása
        const eredmenyDiv = document.createElement('div');
        eredmenyDiv.innerText = 'Eredmény: ' + totalScore.toFixed(2) + ' pont';
        jatekDiv.appendChild(eredmenyDiv);

        // Gomb deaktiválása, hogy többször ne lehessen kattintani
        this.disabled = true;
    });
}

// **Gyakorlás mód inicializálása**
function gyakorlasMode() {
    const jatekDiv = document.getElementById('jatek');
    jatekDiv.innerHTML = ''; // Előző tartalom törlése

    // Hatástani csoportok választása (checkbox-ok)
    const form = document.createElement('div');
    const csopTitle = document.createElement('h3');
    csopTitle.innerText = 'Válassz hatástani csoportokat:';
    form.appendChild(csopTitle);

    hatastaniCsoportok.forEach(csoport => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = csoport;
        checkbox.className = 'csoportCheckbox';
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(csoport));
        form.appendChild(label);
        form.appendChild(document.createElement('br'));
    });

    // Molekulaszám megadása
    const szamLabel = document.createElement('label');
    szamLabel.innerText = 'Molekulák száma: ';
    const szamInput = document.createElement('input');
    szamInput.type = 'number';
    szamInput.id = 'szamInput';
    szamInput.min = '1';
    szamInput.value = '1';
    szamLabel.appendChild(szamInput);
    form.appendChild(szamLabel);
    form.appendChild(document.createElement('br'));

    // Kezdés gomb hozzáadása
    const startBtn = document.createElement('button');
    startBtn.innerText = 'Kezdés';
    form.appendChild(startBtn);

    jatekDiv.appendChild(form);

    startBtn.addEventListener('click', function() {
        // Kiválasztott csoportok lekérése
        const selectedGroups = Array.from(document.getElementsByClassName('csoportCheckbox'))
            .filter(chk => chk.checked)
            .map(chk => chk.value);

        let count = parseInt(szamInput.value);
        if (selectedGroups.length === 0) {
            alert('Válassz legalább egy hatástani csoportot!');
            return;
        }
        if (isNaN(count) || count < 1) {
            alert('Adj meg érvényes molekulaszámot!');
            return;
        }

        // Szűrés: csak a kiválasztott csoportokhoz tartozó molekulák
        let filtered = molekulakData.filter(mol => selectedGroups.includes(mol.hatastani_csoport));
        if (filtered.length === 0) {
            alert('A kiválasztott csoportokhoz nem tartozik egy molekula sem.');
            return;
        }
        if (count > filtered.length) count = filtered.length;

        // Véletlenszerű kiválasztás gyakorláshoz
        const shuffled = filtered.slice().sort(() => 0.5 - Math.random());
        practiceQuestions = shuffled.slice(0, count);
        currentIndex = 0;
        correctCount = 0;

        // Első kérdés megjelenítése
        showQuestion();
    });
}

// **Egy kérdés megjelenítése gyakorlásnál**
function showQuestion() {
    const jatekDiv = document.getElementById('jatek');
    jatekDiv.innerHTML = ''; // Tiszta lappal kezd

    const mol = practiceQuestions[currentIndex];

    // Kérdés sorszáma
    const title = document.createElement('h3');
    title.innerText = `Kérdés ${currentIndex + 1} / ${practiceQuestions.length}`;
    jatekDiv.appendChild(title);

    // Molekula képe
    if (mol.kep) {
        const img = document.createElement('img');
        img.src = 'molekulak/' + mol.kep;
        img.alt = mol.latin;
        img.style.width = '150px';
        jatekDiv.appendChild(img);
    }

    // Latin név kérése
    const latinLabel = document.createElement('label');
    latinLabel.innerText = 'Latin név: ';
    const latinInput = document.createElement('input');
    latinInput.type = 'text';
    latinInput.id = 'practiceLatin';
    latinLabel.appendChild(latinInput);
    jatekDiv.appendChild(latinLabel);
    jatekDiv.appendChild(document.createElement('br'));

    // Hatástani csoport kérés (legördülő)
    if (mol.hatastani_csoport) {
        const csoportLabel = document.createElement('label');
        csoportLabel.innerText = 'Hatástani csoport: ';
        const csoportSelect = document.createElement('select');
        csoportSelect.id = 'practiceCsoport';
        let opt = document.createElement('option');
        opt.value = '';
        opt.innerText = '';
        csoportSelect.appendChild(opt);
        hatastaniCsoportok.forEach(csoport => {
            const option = document.createElement('option');
            option.value = csoport;
            option.innerText = csoport;
            csoportSelect.appendChild(option);
        });
        csoportLabel.appendChild(csoportSelect);
        jatekDiv.appendChild(csoportLabel);
        jatekDiv.appendChild(document.createElement('br'));
    }

    // Alcsoport kérés
    if (mol.alcsoport) {
        const alcLabel = document.createElement('label');
        alcLabel.innerText = 'Alcsoport: ';
        const alcSelect = document.createElement('select');
        alcSelect.id = 'practiceAlcsoport';
        let opt = document.createElement('option');
        opt.value = '';
        opt.innerText = '';
        alcSelect.appendChild(opt);
        alcsoportok.forEach(a => {
            const option = document.createElement('option');
            option.value = a;
            option.innerText = a;
            alcSelect.appendChild(option);
        });
        alcLabel.appendChild(alcSelect);
        jatekDiv.appendChild(alcLabel);
        jatekDiv.appendChild(document.createElement('br'));
    }

    // Target kérés
    if (mol.target) {
        const tarLabel = document.createElement('label');
        tarLabel.innerText = 'Target: ';
        const tarSelect = document.createElement('select');
        tarSelect.id = 'practiceTarget';
        let opt = document.createElement('option');
        opt.value = '';
        opt.innerText = '';
        tarSelect.appendChild(opt);
        targetek.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.innerText = t;
            tarSelect.appendChild(option);
        });
        tarLabel.appendChild(tarSelect);
        jatekDiv.appendChild(tarLabel);
        jatekDiv.appendChild(document.createElement('br'));
    }

    // Generáció kérés
    if (mol.generacio) {
        const genLabel = document.createElement('label');
        genLabel.innerText = 'Generáció: ';
        const genSelect = document.createElement('select');
        genSelect.id = 'practiceGeneracio';
        let opt = document.createElement('option');
        opt.value = '';
        opt.innerText = '';
        genSelect.appendChild(opt);
        generaciok.forEach(g => {
            const option = document.createElement('option');
            option.value = g;
            option.innerText = g;
            genSelect.appendChild(option);
        });
        genLabel.appendChild(genSelect);
        jatekDiv.appendChild(genLabel);
        jatekDiv.appendChild(document.createElement('br'));
    }

    // Ellenőrzés gomb hozzáadása
    const checkBtn = document.createElement('button');
    checkBtn.innerText = 'Ellenőrzés';
    jatekDiv.appendChild(checkBtn);
    checkBtn.addEventListener('click', checkPracticeAnswer);
}

// **Gyakorlás módon: válaszok ellenőrzése**
function checkPracticeAnswer() {
    const mol = practiceQuestions[currentIndex];
    let allCorrect = true;

    // Latin név ellenőrzése
    const latinInput = document.getElementById('practiceLatin');
    const userLatin = latinInput.value.trim();
    if (userLatin.toLowerCase() === mol.latin.toLowerCase()) {
        latinInput.style.backgroundColor = '#c8e6c9';
    } else {
        latinInput.style.backgroundColor = '#ffcdd2';
        const hint = document.createElement('div');
        hint.innerText = 'Helyes latin: ' + mol.latin;
        hint.style.color = 'green';
        latinInput.parentNode.appendChild(hint);
        allCorrect = false;
    }

    // Hatástani csoport ellenőrzése
    if (mol.hatastani_csoport) {
        const csoportSelect = document.getElementById('practiceCsoport');
        const userCsoport = csoportSelect.value;
        if (userCsoport === mol.hatastani_csoport) {
            csoportSelect.style.backgroundColor = '#c8e6c9';
        } else {
            csoportSelect.style.backgroundColor = '#ffcdd2';
            const hint = document.createElement('div');
            hint.innerText = 'Helyes csoport: ' + mol.hatastani_csoport;
            hint.style.color = 'green';
            csoportSelect.parentNode.appendChild(hint);
            allCorrect = false;
        }
    }

    // Alcsoport ellenőrzése
    if (mol.alcsoport) {
        const alcSelect = document.getElementById('practiceAlcsoport');
        const userA = alcSelect.value;
        if (userA === mol.alcsoport) {
            alcSelect.style.backgroundColor = '#c8e6c9';
        } else {
            alcSelect.style.backgroundColor = '#ffcdd2';
            const hint = document.createElement('div');
            hint.innerText = 'Helyes alcsoport: ' + mol.alcsoport;
            hint.style.color = 'green';
            alcSelect.parentNode.appendChild(hint);
            allCorrect = false;
        }
    }

    // Target ellenőrzése
    if (mol.target) {
        const tarSelect = document.getElementById('practiceTarget');
        const userT = tarSelect.value;
        if (userT === mol.target) {
            tarSelect.style.backgroundColor = '#c8e6c9';
        } else {
            tarSelect.style.backgroundColor = '#ffcdd2';
            const hint = document.createElement('div');
            hint.innerText = 'Helyes target: ' + mol.target;
            hint.style.color = 'green';
            tarSelect.parentNode.appendChild(hint);
            allCorrect = false;
        }
    }

    // Generáció ellenőrzése
    if (mol.generacio) {
        const genSelect = document.getElementById('practiceGeneracio');
        const userG = genSelect.value;
        if (userG === mol.generacio) {
            genSelect.style.backgroundColor = '#c8e6c9';
        } else {
            genSelect.style.backgroundColor = '#ffcdd2';
            const hint = document.createElement('div');
            hint.innerText = 'Helyes generáció: ' + mol.generacio;
            hint.style.color = 'green';
            genSelect.parentNode.appendChild(hint);
            allCorrect = false;
        }
    }

    // Pontszám növelése, ha minden rész helyes
    if (allCorrect) {
        correctCount++;
    }

    // Ellenőrzés gomb inaktívvá tétele
    this.disabled = true;

    // Következő lépések: vagy folytatás vagy eredmény
    const nextBtn = document.createElement('button');
    if (currentIndex < practiceQuestions.length - 1) {
        nextBtn.innerText = 'Következő kérdés';
        nextBtn.addEventListener('click', function() {
            currentIndex++;
            showQuestion();
        });
    } else {
        nextBtn.innerText = 'Eredmény';
        nextBtn.addEventListener('click', showPracticeResult);
    }
    document.getElementById('jatek').appendChild(nextBtn);
}

// **Gyakorlás mód eredményének megjelenítése**
function showPracticeResult() {
    const jatekDiv = document.getElementById('jatek');
    jatekDiv.innerHTML = '';
    const percent = Math.round((correctCount / practiceQuestions.length) * 100);
    const result = document.createElement('div');
    result.innerText = `A helyes válaszok aránya: ${percent}%`;
    jatekDiv.appendChild(result);
}


