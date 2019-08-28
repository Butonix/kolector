/**
 * Clasa `createElement` va creea elemente HTML
 * @param {String} tag este un și de caractere care indică ce tip de element va fi creat
 * @param {String} id este un șir de caractere care indică un id pentru element
 * @param {String} cls este un șir de caractere care indică clasele elementului
 * @param {Object} attrs este un obiect de configurare a elementului care permite definirea de atribute
 */
class createElement {
    constructor(tag, id, cls, attrs){
        this.id = id;
        this.tag = tag;
        this.classes = [...cls];
        this.attributes = attrs;    // va fi un un obiect de configurare, fiecare membru fiind un posibil atribut.
    }
    /**
     * Metoda `creeazaElem()` generează obiectul DOM
     * @param {String} textContent Este conținutul de text al elementului, dacă acest lucru este necesar
     * @param {Boolean} requiredElem Specifică dacă un element are atributul `required`
     */
    creeazaElem (textContent, requiredElem) {
        const element = document.createElement(this.tag);
        if (this.id) element.id = this.id;
        if (this.classes) element.classList.add(...this.classes);
        if (this.attributes) {
            for (let [key, val] of Object.entries(this.attributes)) {
                element.setAttribute(key, val);
            }
        }
        // if (textContent) element.textContent = textContent;
        if (textContent) {
            var text = '' + textContent;
            let encodedStr = decodeCharEntities(text); // decodifică entitățile 
            let txtN = document.createTextNode(encodedStr);
            element.appendChild(txtN);
        }
        if (requiredElem) element.required = true;
        return element;
    }
}
// este setul opțiunilor pentru selecție de limbă în cazul minorităților
let langsMin = new Map([
    ['rum', 'română'],
    ['ger', 'germana'],
    ['hun', 'maghiară'],
    ['srp', 'sârbă'],
    ['rom', 'rromani'],
    ['slo', 'slovenă'],
    ['cze', 'cehă'],
    ['ukr', 'ukraineană'],
    ['bul', 'bulgară'],
    ['hrv', 'croată'],
    ['ita', 'italiană'],
    ['gre', 'greacă'],
    ['rus', 'rusă'],
    ['tur', 'turcă']
]);

/**
 * Funcția `encodeHTMLentities()` convertește un string în entități html.
 * @param {String} str Este un string de cod HTML care nu este escaped
 */
function encodeHTMLentities (str) {
    var buf = [];			
    for (var i = str.length-1; i >= 0; i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }    
    return buf.join('');
}

/**
 * Convertește un characterSet html în caracterul originar.
 * @param {String} str htmlSet entities
 **/
function decodeCharEntities (str) {
    let decomposedStr = str.split(' ');
    // FIXME: Nu acoperă toate posibilele cazuri!!! ar trebui revizuit la un moment dat.
    var entity = /&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);?/igu;
    // var codePoint = /\\u(?:\{[0-9A-F]+|[A-F0-9]+)\}?/igu;
    
    let arrNew = decomposedStr.map(function (word, index, arr) {
        let newArr = [];
        if (word.match(entity)) {
            let fragment = [...word.match(entity)];

            for (let ent of fragment) {
                var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
                var translate = {
                    "nbsp" : " ",
                    "amp"  : "&",
                    "quot" : "\"",
                    "apos" : "\'",
                    "cent" : "¢",
                    "pound": "£",
                    "yen"  : "¥",
                    "euro" : "€",
                    "copy" : "©",
                    "reg"  : "®",
                    "lt"   : "<",
                    "gt"   : ">"
                };
                return ent.replace(translate_re, function (match, entity) {
                    return translate[entity];
                }).replace(/&#(\d+);/gi, function (match, numStr) {
                    var num = parseInt(numStr, 10);
                    return String.fromCharCode(num);
                });
            }
            return arrNew;
        } else {
            newArr.push(word);
        }
        return newArr.join('');
    });
    return arrNew.join(' ');
}

/**
 * Funcția `selectOpts` generează opțiuni pentru un element `select`
 * @param {Object} insertie este elementul `<select>`
 * @param {Array} arrData este un set de date ca `Map` ce conține datele după care se va genera elementul `option`
 */
function selectOpts (insertie, arrDate) {    
    arrDate.forEach((val, key) => {
        const optionElem = new createElement('option', '', '', {
            value: key
        }).creeazaElem(val);
        insertie.appendChild(optionElem);
    });
}

/**
 * Funcția `creeazaTitluAlternativ` generează mecanismul prin care se pot adăuga titluri alternative celui principal
 * Folosește funcția `creeazaTitluAlternativHelper` pentru a genera structura DOM
 */
function creeazaTitluAlternativ () {
    // creează aceleași elemente de formular responsabile cu generarea unui titlu
    let insertie = document.querySelector('#langAlternative');  // punct de aclanșare în DOM pentru elementele generate dinamic
    let primulTitlu = document.querySelector('#titluRes').id;   // extrage id-ul primului titlu pe baza căruia se vor construi restul în cele alternative
    let arrAlternative = document.querySelectorAll('#langAlternative > div'); // selectează toate elementele din titlurile alternative (dacă există)

    // verifică dacă există elemente ca titluri alternative
    if (arrAlternative.length !== 0) {
        let lastAlternativeTitle = Array.from(arrAlternative).slice(-1); // fă o referință către ultimul introdus în alternative
        let idOfLastElem = lastAlternativeTitle[0].id;  // extrage id-ul acelui element
        let contorIdxIds = parseInt(idOfLastElem.slice(-1)); // din id, extrage numarul de incrementare (pentru primul element adăugat în alternative este 1).
        creeazaTitluAlternativHelper(`${primulTitlu}-${++contorIdxIds}`, insertie); // adaugă titluri alternative după primul alternativ existent!!!
        
        // Pentru a atașa evenimentul, extrage id-ul ultimului element introdus în alternative
        var id2Nr = parseInt(idOfLastElem.slice(-1));
        let idElement = `#${primulTitlu}-${++id2Nr}`;
        let butRemove = document.querySelector(idElement);
        butRemove.addEventListener('click', (event) => {
            insertie.removeChild(document.querySelector(`${idElement}`));
        });
    } else {
        // dacă nu există titluri alternative, se va crea primul în această ramură
        let newId = `${primulTitlu}-1`;
        creeazaTitluAlternativHelper(newId, insertie);

        let butRemoveFirst = document.querySelector(`#${primulTitlu}-1-remove`);
        butRemoveFirst.addEventListener('click', (event) => {
            insertie.removeChild(document.querySelector(`#${newId}`));
        });
    }
}

/**
 * Funcția `creeazaTitluAlternativHelper()` servește funcției `creeazaTitluAlternativ()`.
 * Are rolul de a genera întreaga structură DOM necesară inserării unui nou titlu alternativ.
 * Folosește funcția `selectOpts()` pentru a genera elementele `<option>`
 * @param {String} id Este id-ul elementului `<select>` căruia i se adaugă elementele `<option>`
 * @param {Object} insertie Este elementul la care se va atașa întreaga structură `<option>` generată
 */
function creeazaTitluAlternativHelper (id, insertie) {
    const divInputGroup        = new createElement('div', `${id}`,        ['input-group'],         {}).creeazaElem();
    const divInputGroupPrepend = new createElement('div', '',             ['input-group-prepend'], {}).creeazaElem();
    const spanInputgroupText   = new createElement('span', `${id}-descr`, ['input-group-text'],    {}).creeazaElem('Titlul resursei');
    divInputGroupPrepend.appendChild(spanInputgroupText);
    divInputGroup.appendChild(divInputGroupPrepend);

    const inputTitle = new createElement('input', '', ['form-control'], {
        type: 'text',
        name: `${id}`,
        ['aria-label']: 'Titlul resursei',
        ['aria-describedby']: `${id}-descr`
    }).creeazaElem('', true);
    divInputGroup.appendChild(inputTitle);

    const divInputGroupPrepend2 = new createElement('div',    '', ['input-group-prepend'], {}).creeazaElem();        
    const langSelectLabel       = new createElement('span',   '', ['input-group-text'],    {}).creeazaElem('Indică limba');    
    divInputGroupPrepend2.appendChild(langSelectLabel);
    divInputGroup.appendChild(divInputGroupPrepend2);

    const elemSelect   = new createElement('select', `${id}-select`, ['custom-select', 'col-6', 'col-lg-4'], {}).creeazaElem();
    const deleteTitAlt = new createElement('button', `${id}-remove`, ['btn', 'btn-danger'],                  {}).creeazaElem("\u{1F5D1}");

    selectOpts(elemSelect, langsMin); // generează toate opțiunile de limbă ale select-ului
    divInputGroup.appendChild(elemSelect);
    divInputGroup.appendChild(deleteTitAlt);

    insertie.appendChild(divInputGroup);
}

/* === Constituirea selectorului pentru disciplină === */
var niveluri = document.querySelectorAll('.nivel');
var discipline = document.querySelector('#discipline');
niveluri.forEach(function (checkbox) {
    checkbox.addEventListener('click', (event) => {
        // TODO: Mai întâi verifică dacă elementele nu cumva se află în zona disciplinelor alese
        // fa un array cu toate valorile existente
        // discExistente = [];
        // document.querySelectorAll("#discipline input[type='checkbox']:checked").forEach(({value}) => {
        //     discExistente.push(value);
        // });
        // console.log(discExistente);
        var data = JSON.parse(JSON.stringify(event.target.dataset)); // constituie un obiect cu toate datele din `data=*` a checkbox-ului
        // verifică dacă nu cumva bifa nu mai este checked. În cazul acesta șterge toate disciplinele asociate
        if(event.target.checked === false) {
            // Pentru fiecare valoare din data, șterge elementul din discipline
            for (let [k, v] of Object.entries(data)) {
                let elemExistent = document.querySelector(`.${k}`); // k este codul disciplinei care a fost pus drept clasă pentru discipline
                discipline.removeChild(elemExistent); // șterge disciplina
            }
        } else {
            // dacă event.target.checked a fost bifat - avem `checked`, vom genera elementele checkbox.
            for (let [key, val] of Object.entries(data)) {
                // crearea checkbox - urilor
                let inputCheckBx      = new createElement('input', '', ['form-check-input'],      {type: "checkbox", autocomplete: "off", value: key}).creeazaElem();
                let labelBtn          = new createElement('label', '', ['btn', 'btn-success'],    {}).creeazaElem(val);
                let divBtnGroupToggle = new createElement('div',   '', ['btn-group-toggle', key], {"data-toggle": "buttons"}).creeazaElem();            
                labelBtn.appendChild(inputCheckBx);
                divBtnGroupToggle.appendChild(labelBtn);
                discipline.appendChild(divBtnGroupToggle);
            }
        }
    });
});

/* === Prezentarea competențelor specifice === */
var compSpecPaginator = document.querySelector('#paginatorSec04');
/**
 * Funcția `diciplineBifate` are rolul de a extrage datele pentru disciplinele existente în vederea
 * constituirii obiectului mare care să fie trimis spre baza de date. 
 * Pentru că se folosește Bootstrap 4, aceasta este soluția corectă în cazul checkbox-urilor.
 * TODO: Extinde suportul și pentru celelalte situații de checkbox-uri pentru concizie!!! (arii în relații, și niveluri în relație)
 */
function disciplineBifate () {
    let values = [];
    document.querySelectorAll("#discipline input[type='checkbox']:checked").forEach(({value}) => {
        values.push(value);
    });
    // TODO: emite apel socket către baza de date și extrage conform selecției, un subset  (ex: [ "matexpmed2", "comlbrom2" ])    
    // console.log(values);
    pubComm.on('csuri', (csuri) => {
        // TODO: execută funcție care generează conținutul tabelului.
        const tabelComps = document.querySelector('#competenteS'); // selectează tabelul țintă
        
        const CSlist = JSON.parse(csuri);   // transformă stringul în array JS
        
        // generează headerul tabelului
        const theadElem = document.createElement('thead');  // crează elementul thead
        const obiSketch = CSlist[0];                        // extrage primul obiect pentru a extrage cheile.
        const numeChei = Object.keys(obiSketch);            // extrage cheile obiectului care vor constitui textele din header

        // creează primul element thead
        const thElem1 = document.createElement('th');
        const headNume = document.createTextNode(numeChei[7]);  // această cheie este `nume`
        thElem1.appendChild(headNume);  // adaugă textul în elementul `<thead>`

        // creează al doilea element thead
        const thElem2 = document.createElement('th');
        const headCompGen = document.createTextNode(numeChei[10]); // această cheie este `parteA`
        thElem2.appendChild(headCompGen);  // adaugă textul în elementul `<thead>`

        // creează al treilea element thead
        const thElem3 = document.createElement('th');
        const headDisc = document.createTextNode(numeChei[3]);  // această cheie este `disciplina`
        thElem3.appendChild(headDisc);  // adaugă textul în elementul `<thead>`

        // creează al patrulea element thead
        const thElem4 = document.createElement('th');
        const headActivs = document.createTextNode(numeChei[2]);  // această cheie este `actvitati`
        thElem4.appendChild(headActivs);  // adaugă textul în elementul `<thead>`

        // creează al cincilea element thead
        const thElem5 = document.createElement('th');
        const headCheckB = document.createTextNode('selecteaza'); // adaugă selectorul
        thElem5.appendChild(headCheckB); // adaugă textul în elementul `<thead`

        theadElem.appendChild(thElem1); // adaugă în `<thead>` primul `<th>`      nume.
        theadElem.appendChild(thElem2); // adaugă în `<thead>` al doilea `<th>`   parteA.
        theadElem.appendChild(thElem3); // adaugă în `<thead>` al treilea `<th>`  disciplina.
        theadElem.appendChild(thElem4); // adaugă în `<thead>` al patrulea `<th>` activitati.
        theadElem.appendChild(thElem5); // adaugă în `<thead>` al cicilea `<th>`  selecteaza.

        tabelComps.appendChild(theadElem); // adaugă elementul thead în tabel

        // creează corpul tabelului
        const corp = document.createElement('tbody');

        // populează corpul tabelului
        for (let obi of CSlist) {
            // console.log(obi);
            const genTr = document.createElement('tr'); // creează <tr>-ul

            const genTdNume = document.createElement('td');       // creează <td>-ul
            const genTdParteA = document.createElement('td');     // creează <td>-ul
            const genTdDisciplina = document.createElement('td'); // creează <td>-ul

            const nume = document.createTextNode(`${obi.nume}`);            // creează textul din td
            const parteA = document.createTextNode(`${obi.parteA}`);        // creează textul din td
            const disciplina = document.createTextNode(`${obi.disciplina}`);// creează textul din td

            genTdNume.appendChild(nume);            // adaugă în DOM nume
            genTdParteA.appendChild(parteA);        // adaugă în DOM parteA
            genTdDisciplina.appendChild(disciplina);// adaugă în DOM disciplina

            // crearea combo-ului de activități
            const genTdActivitati = document.createElement('td'); // creează <td>-ul
            const ulActivitati = document.createElement('ul');
            genTdActivitati.appendChild(ulActivitati);
            
            for (let activ of obi.activitati) {
                // console.log(obi.activitati);
                let liActiv = document.createElement('li');
                let txtActiv = document.createTextNode(`${activ}`);
                liActiv.appendChild(txtActiv);
                ulActivitati.appendChild(liActiv);
            }

            // crearea checkbox-ului de selecție
            const genTdSelect = document.createElement('td'); // creează <td>-ul
            const selectCheckB = document.createElement('input');
            // Atributele
            selectCheckB.type = "checkbox"; 
            selectCheckB.name = `${obi.cod}`; 
            selectCheckB.value = `${obi.cod}`; 
            selectCheckB.id = `${obi.cod}`; 

            // creating label for checkbox 
            var label = document.createElement('label'); 
            label.htmlFor = `${obi.cod}`;
            label.appendChild(document.createTextNode(' selectează')); 

            genTdSelect.appendChild(selectCheckB); 
            genTdSelect.appendChild(label); 

            // adaugă <td> -ul `nume` la <tr>
            genTr.appendChild(genTdNume);
            genTr.appendChild(genTdParteA);
            genTr.appendChild(genTdDisciplina);
            genTr.appendChild(genTdActivitati);
            genTr.appendChild(genTdSelect);

            // adaugă <tr>-ul generat la corpul tabelului
            corp.appendChild(genTr);
        }


        tabelComps.appendChild(corp); // Încheie construcția tabelului prin adaugarea corpului și conținutului său la elementul `<table>`
        // broadcastMes(mess);
        // console.log(csuri);
    });
    pubComm.emit('csuri', values);
}
// adaugă un eveniment click pe evantaiul Bootstrap 4 pentru a popula tabelul cu date din mongo
compSpecPaginator.addEventListener('click', (ev) => {
    disciplineBifate();
});

