require('dotenv').config();
const fs    = require('fs');
const path  = require('path');
const Papa  = require('papaparse');
const csv   = require("fast-csv");
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_LOCAL_CONN, {
    auth: { "authSource": "admin" },
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWD,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
// const writeF = fs.createWriteStream('CSuriX.json', 'utf8'); // Generează un JSON în caz că acest lucru este necesar. Să fie acolo.

/**
 * Funcția are rolul de a strânge toate activitățile unei competențe specifice într-un array dedicat.
 * Când sunt erori, problema stă în normalizarea datelor. ATENȚIE! M-am opărit!
 * @param {Object} data Este un obiect de date
 */
function foldOneField (data) {
    const arr = JSON.stringify(data);
    const folded = data.reduce((arrAcc, elemArrOrig, idx, srcArr) => {
        // Inițial, acumulatorul este un array fără niciun element. Este necesară introducerea primului:
        if (arrAcc.length === 0) {
            arrAcc[idx] = elemArrOrig;
        }
        // Verifică câmpul `ids` al ultimului element din array (ultimul introdus)
        if (arrAcc.slice(-1)[0].ids[0] === elemArrOrig.ids[0]) {
            // pentru toate activitățile existente în array-ul `activități`,
            elemArrOrig.activitati.forEach((act) => {
                arrAcc.slice(-1)[0].activitati.push(act); // introdu-le în array-ul activități a înregistrării preexistente
            });
        } else {
            // În cazul în care `ids` diferă, înseamnă că ai de-a face cu o nouă competență, care va constitui o nouă înregistrare
            arrAcc.push(srcArr[idx]); // care la rândul ei va împături activități.
        }
        return arrAcc;
    }, []);
    return folded;
}

// TODO: DEZVOLTĂ MAI DEPARTE ÎNTR-UN AUTOMATOR!!!
/* ============ OBȚINEREA CĂILOR TUTUROR FIȘIERELOR =============== */
// De la https://gist.github.com/kethinov/6658166
var dir = 'csvuri'; // este numele directorului în care vor sta toate fișierele care trebuie concatenate
/**
 * Funcția area rolul de a genera un Array cu toate fișierele existente în directorul desemnat prin variabila `dir`
 * @param {String} dir Numele directorului în care se află fișierele care trebuie concatenate
 */
const read = (dir) =>
    fs.readdirSync(dir)
        .reduce((files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory() ?
                files.concat(read(path.join(dir, file))) :
                files.concat(path.join(dir, file)),
            []);

// În caz că vrei să afișezi numele fișierelor prelucrate în vreun context viitor, activeză fragmentul !!!
// walk('/csvuri/').then((res) => {
//     console.log(res); // fa ceva cu lista de fișiere
// });

/* ======== CONCATENAREA TUTUROR CSV-urilor în unul singur ================ */
/**
 * Funcția `concatCSVAndOutput` construiește un array de promisiuni pentru fiecare fișier csv
 * pe care îl și rezolvă cu Promise.all
 * De la https://stackoverflow.com/questions/50905202/how-to-merge-two-csv-files-rows-in-node-js
 * Pentru utilizarea funcției, trebuie să avem dependința `fast-csv` instalată deja
 * @param {Array} csvFilePaths 
 * @param {String} outputFilePath 
 * @returns {Promise}
 */
function concatCSVAndOutput(csvFilePaths, outputFilePath) {
    // construiești un array de promisiuni
    const promises = csvFilePaths.map((path) => {
        // pentru fiecare fișier CSV, generează o promisiune.
        return new Promise((resolve) => {
            const dataArray = [];
            return csv
                .parseFile(path, {
                    headers: true
                })
                .on('data', function (data) {
                    dataArray.push(data);
                })
                .on('end', function () {
                    resolve(dataArray);
                });
        });
    });

    return Promise.all(promises)
                .then((results) => {
                    // constituirea stream-ului Readable care va fi chiar fișierului CSV de output
                    const csvStream = csv.format({headers: true});

                    // constituirea stream-ului Writeable
                    const writableStream = fs.createWriteStream(outputFilePath);
                    // la finalizarea scrierii pe disc
                    writableStream.on('finish', function () {
                        console.log('Am terminat de scris rezultatul!');
                    });

                    csvStream.pipe(writableStream);
                    // scrie fișierul trimițând fiecare linie csv operațiunea de scriere a stream-ul
                    results.forEach((result) => {
                        result.forEach((data) => {
                            csvStream.write(data);
                        });
                    });
                    csvStream.end();
                });
}
// generează fișierul consolidat cu toate câmpurile din toate csv-urile
// concatCSVAndOutput(read(dir), `${dir}/all.csv`);

const readF = fs.createReadStream(`${dir}/all.csv`, 'utf8'); // Creează stream Read din fișierul CSV sursă.

/* ======= PRELUCRAREA CSV-ului ============  */
Papa.parse(readF, {
    header: true,
    encoding: 'utf8',
    transformHeader: function (header) {
        // console.log(header);
        if (header === 'nume') return 'nume';
        if (header === 'ids') return 'ids';
        if (header === 'cod') return 'cod';
        if (header === 'activitate') return 'activitati';
        if (header === 'disciplină') return 'disciplina';
        if (header === 'coddisc') return 'coddisc';
        if (header === 'nivel') return 'nivel';
        if (header === 'act normativ') return 'ref';
        if (header === 'competență generală') return 'parteA';
        if (header === 'număr competența generală') return 'compGen';
    },
    transform: function (value, headName) {
        // console.log(headName);
        // Array.isArray(obj) ? obj:[obj]
        if (headName === 'nume') {
            return value;
        } else if (headName === 'ids') {
            value = [].concat(value);
            return value;
        } else if ((headName === 'cod')) {
            return value;
        } else if (headName === 'activitati') {
            value = [].concat(value);
            return value;
        } else if (headName === 'disciplina') {
            value = [].concat(value);
            return value;           
        } else if (headName === 'coddisc') {
            return value;           
        } else if (headName === 'nivel') {
            value = [].concat(value);
            return value;
        } else if (headName === 'ref') {
            value = [].concat(value);
            return value;
        } else if (headName === 'parteA') {
            return value;
        } else if (headName === 'compGen') {
            return value;
        }
    },
    complete: function (results, file) {
        if (results.errors) {
            console.log(results.errors);
        }
        const folded = foldOneField(results.data); // apelează funcția de folding
        // scrie datele pe disc...
        // fs.writeFile(`${dir}/all.json`, JSON.stringify(folded), 'utf8', (err) => {
        //     if (err) throw err;
        // });
        
        // scrie datele în bază
        const CSModel = require('../models/competenta-specifica');
        // mongoose.connection.dropCollection('competentaspecificas'); // Fii foarte atent: șterge toate datele din colecție la fiecare load!.
        
        CSModel.insertMany(folded, function cbInsMany (err, result) {
            if (err) {
                console.log(err);
                process.exit();
            } else {
                console.log('Înregistrări inserate în colecție: ', result.length);
                process.exit();
            }
        });
    },
    error: function (err, file) {
        if (err) {
            console.log(err.message);
        }
    }
});