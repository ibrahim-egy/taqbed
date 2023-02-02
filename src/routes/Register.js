const express = require('express');
const router = express.Router();


const db = require('../db/mongo');
const User = db.User


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