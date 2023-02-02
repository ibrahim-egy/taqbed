const express = require('express');
const router = express.Router();
const passport = require('passport');

const db = require('../db/mongo');
const User = db.User


passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


router.route('/')
    .get(function (req, res) {
        res.render('register')
    })
    .post(function (req, res) {

        User.register({ username: req.body.username }, req.body.password, function (err, user) {
            if (err) {
                console.log(err)
                res.redirect('/register')
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/data')
                })
            }
        })


    });

module.exports = router;