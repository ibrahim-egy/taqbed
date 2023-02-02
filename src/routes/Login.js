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
        res.render('login')
    })
    .post(function (req, res) {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
        req.login(user, function (err) {
            if (err) {
                res.redirect('/login')
            } else {
                passport.authenticate('local', { failureRedirect: '/login' })(req, res, function () {
                    res.redirect('/data')
                })
            }
        })

    });


module.exports = router;