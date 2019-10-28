const userModel = require('../../models/user');
const mongoose  = require('mongoose');

function googleStrategy (request, accessToken, refreshToken, params, profile, done) {
    // popularea modelului cu date
    const record = {
        _id: new mongoose.Types.ObjectId(),
        email: profile._json.email,
        googleID: profile.id,
        googleProfile: {
            name:          profile._json.name,
            given_name:    profile._json.given_name,
            family_name:   profile._json.family_name,
            picture:       profile._json.picture,
            token:         accessToken,
            refresh_token: refreshToken,
            token_type:    params.token_type,
            expires_in:    params.expires_in
        },
        roles: {
            admin:     false,
            public:    false,
            rolInCRED: [],
            unit:      []
        },
        created: Date.now()
    };
    // numără câte înregistrări sunt în colecție.
    // var noRecs = userModel.find().estimatedDocumentCount( (err, count) => { // FIXME: Folosește secvența când faci upgrade la MongoDB 4.0.3 sau peste
    userModel.find().countDocuments( (err, count) => {
        // DACĂ nu găsește nicio înregistrare, creează direct pe prima care va fi și admin
        if (count == 0) {
            record.roles.rolInCRED.push('admin'); // introdu rolul de administrator în array-ul rolurilor
            record.roles.rolInCRED.push('cred');  // introdu rolul de user cred în array-ul rolurilor
            record.roles.unit.push('global');     // unitatea este necesară pentru a face segregări ulterioare în funcție de apartenența la o unitate orice ar însemna aceasta
            record.roles.admin = true;
            const userObj = new userModel(record);
            userObj.save(function (err, user) {
                if (err) throw new Error('Eroarea la salvarea userului este: ', err.message);
                // console.log("Salvez user în bază!");
                done(null, user);
            });
        // DACĂ sunt înregistrări în colecție, caută după email dacă deja există
        } else {
            userModel.findOne({ email: profile._json.email }, (err, user) => {
                if (err) throw new Error('A apărut următoarea eroare la căutarea utilizatorului: ', err.message);    
                // Dacă userul există deja, treci pe următorul middleware.
                if(user) {
                    // console.log(user.roles);
                    done(null, user); 
                } else {
                    if (profile._json.email.endsWith('@educred.ro')) {
                        record.roles.rolInCRED.push("user"); // în afară de admin, toți cei care se vor loga ulterior vor porni ca useri simpli
                    } else {
                        // dacă cineva din exteriorul proiectului se înscrie, contul se va face cu rol de user
                        record.roles.public = true;
                    }
                    // dacă NU există acest user în bază, va fi adăugat fără a fi admin.
                    record.roles.admin = false;
                    record.roles.unit.push('global');     // unitatea este necesară pentru a face segregări ulterioare în funcție de apartenența la o unitate orice ar însemna aceasta
                    const newUserObj = new userModel(record);
                    newUserObj.save(function (err, user) {
                        if (err) throw err;
                        // console.log("Salvez user în bază!");
                        done(null, user);
                    });
                }
            });
        }
    });
}
module.exports = googleStrategy;