require('dotenv').config();
/* ==== DEPENDINȚE ==== */
const express = require('express');
const router  = express.Router();
const passport= require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const LocalStrategy = require('passport-local').Strategy;

// Încarcă controlerul necesar tratării rutelor de autentificare
const UserPassport = require('./controllers/user.ctrl')(passport);

/* === LOGIN [GET] === */
router.get('/', (req, res, next) => {
    // console.log("Din user.ctrl avem din req.body pe /login: ", req.body);
    res.render('login', {
        title:    "login",
        style:   "/lib/fontawesome/css/fontawesome.min.css",
        logoimg:  "img/rED-logo192.png",
        credlogo: "img/CREDlogo150.jpg"
    });
});

const mongoose = require('mongoose');

/* === LOGIN [POST] ===*/ // passport.authenticate('local', {failureRedirect: '/login'}),
router.post('/',  passport.authenticate('local', { failureRedirect: '/login'}), (req, res, next) => {
    // console.log("Din login.js avem din req.body pe /login: ", req.body);
    res.redirect('/');
});

module.exports = router;