const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var favicon = require('serve-favicon');

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(favicon(__dirname + '/public/images/favicon.ico'));

mongoose.connect("mongodb+srv://ibrahim:" + process.env.mongodbPass + "@cluster0.n66dv.mongodb.net/babaDB")


userSchema = new mongoose.Schema({
    name: String,
    password: String
})
ownerSchema = new mongoose.Schema({
    name: String,
    nationalId: Number,
    nextPayment: String,
    category: String,
    amount: Number,
    amountPerMonth: Number,
    note: String,
    byWho: String
})

deletedOwnersSchema = new mongoose.Schema({
    name: String,
    nationalId: Number,
    nextPayment: String,
    category: String,
    amount: Number,
    amountPerMonth: Number,
    note: String
})

monthTotalSchema = new mongoose.Schema({
    monthNumber: Number,
    monthTotal: Number,
    year: Number
})

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('user', userSchema)
const Owner = new mongoose.model('owner', ownerSchema)
const DeletedOwner = new mongoose.model('deletedOwner', deletedOwnersSchema)
const Total = new mongoose.model('monthTotal', monthTotalSchema)



passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


function updateDate(date) {
    year = parseInt(date.split('-')[0]) + 1
    year = year.toString()
    const newDate = year + '-' + date.substring(5, 10)
    return newDate;
}

function updateSDate(date, months) {
    year = parseInt(date.split('-')[0])
    month = parseInt(date.split('-')[1]) + months
    if (month > 12) {
        month -= 12
        year += 1
    }
    if (month < 10) {
        month = '0' + month.toString();
    }
    const newDate = year + '-' + month + '-' + date.substring(8, 10)
    return newDate

}

app.get('/', function (req, res) {
    res.render('index')
})

app.route('/register')
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

app.route('/login')
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



app.route('/data')
    .get(function (req, res) {

        if (req.isAuthenticated()) {
            let owners = []
            Owner.find({}, function (err, o) {
                if (!err) {
                    o.forEach(owner => {
                        owners.push(owner.name)
                    });
                    let ownerss = owners.filter((item, index) => {
                        return owners.indexOf(item) === index;
                    })
                    res.render('data', {
                        owners: ownerss,
                    })
                }
            })

        } else {
            console.log("Unauthorized")
            res.redirect('/login')
        }
    })
    .post(function (req, res) {
        if (req.isAuthenticated()) {
            ownerName = req.body.name;
            if (ownerName == '' || ownerName == null) {
                res.redirect('/data')

            } else if (ownerName == "TOTAL") {
                res.redirect('/total')
            }
            else {
                var string = encodeURIComponent(ownerName);
                res.redirect('/owner?name=' + string)
            }

        } else {
            console.log("Not authorized")
            res.redirect('/login')
        }
    })

app.get('/allOwners', function (req, res) {

    if (req.isAuthenticated()) {
        Owner.find({}, function (err, owners) {
            res.render('allOwners', { owners: owners })
        })
    } else {
        res.redirect('/login')
    }
})

app.route('/add')
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            res.render('add')
        } else {
            console.log("Not authorized")
            res.redirect('/login')
        }
    })
    .post(function (req, res) {
        const newOwner = new Owner({
            name: req.body.name,
            nationalId: req.body.nationalId,
            nextPayment: req.body.nextPayment,
            amount: req.body.amount,
            amountPerMonth: req.body.amountPerMonth,
            category: req.body.category,
            note: req.body.note,
            byWho: req.user.username
        })
        newOwner.save(err => {
            if (err) {
                console.log(err)
            } else {
                console.log('Successfully added new user in the DB.🌚');
                var string = encodeURIComponent(newOwner.name);
                res.redirect('/owner?name=' + string)
            }
        })

    })



app.route('/owner')
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            Owner.find({ name: req.query.name }, function (err, owners) {
                if (!err) {
                    if (owners.length != 0) {
                        res.render('owner', { owners: owners })
                    } else {
                        res.redirect('/data')
                    }
                } else {
                    res.redirect('/data')
                }
            })
        } else {
            res.redirect('/login')
        }
    })
    .post(function (req, res) {

        if (req.body.where === 'allOwnersPost') {
            Owner.findById({ _id: req.body.id }, function (err, owner) {
                if (!err) {
                    res.render('owner', { owners: [owner] })
                }
            })
        } else {

            const nextPayment = req.body.nextPayment
            if (typeof req.body.monthCount != 'undefined') {

                var amount = req.body.amountPerMonth * req.body.monthCount
                var newDate = updateSDate(nextPayment, Number(req.body.monthCount))
            } else {
                var amount = req.body.amount
                var newDate = updateDate(nextPayment);
            }
            const d = new Date();
            const currentMonth = d.getMonth() + 1;
            const currentYear = d.getFullYear();
            Owner.updateOne({ _id: req.body.ownerId }, { $set: { nextPayment: newDate, note: "تم القبض يوم " + nextPayment + " مبلغ " + amount, byWho: req.user.username } }, function (err, result) {
                if (!err) {
                    console.log("Successfully Updated owner.🌚")
                    Total.findOne({ monthNumber: currentMonth, year: currentYear }, function (err, month) {
                        if (!err) {
                            if (month) {
                                console.log(month);
                                const t = parseInt(month.monthTotal) + parseInt(amount);
                                month.monthTotal = t;
                                month.save();
                                res.redirect('/data')
                                console.log(month);

                            } else {
                                const newMonth = new Total({
                                    monthNumber: currentMonth,
                                    monthTotal: parseInt(amount),
                                    year: currentYear
                                })
                                newMonth.save(() => {
                                    res.redirect('/data')
                                })
                            }


                        } else {
                            console.log(err);
                            res.redirect('/data')
                        }
                    })

                } else {
                    console.log(err)
                }

            })
        }


    })


app.route('/edit/:ownerId')
    .get(function (req, res) {
        const ownerId = req.params.ownerId
        Owner.findById(ownerId, function (err, owner) {
            res.render('edit', { owner: owner })
        })

    })
    .post(function (req, res) {

        Owner.updateOne({ _id: req.params.ownerId }, {
            $set:
            {
                name: req.body.name,
                nationalId: req.body.nationalId,
                nextPayment: req.body.nextPayment,
                amount: req.body.amount,
                amountPerMonth: req.body.amountPerMonth,
                category: req.body.category,
                note: req.body.note
            }
        }, function (err, result) {
            if (!err) {
                console.log("Successfully Updated Owner.🌚")
                console.log(result)
                var string = encodeURIComponent(req.body.name);
                res.redirect('/owner?name=' + string)
            } else {
                console.log(err)
            }
        })

    })


app.route("/total")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            Total.find({}, function (err, total) {
                if (!err) {
                    res.render('total', { total: total })
                } else {
                    res.redirect('/data')
                }
            })
        } else {
            res.redirect('/login')
        }
    })
    .post (function (req, res) {

        const totalDiff = Number(req.body.totalDiff);
        let id = req.body.id.filter((id) => {
            return id != "";
        })
        id = id[0];

        Total.findById(id, function (err, month) {
            if (!err) {
                month.monthTotal += totalDiff;
                month.save(() => {
                    res.redirect('/total')
                });
            } else {    
                console.log(err);
                res.redirect('/total')
            }
        })
        

        
    })

app.post('/delete/:ownerId', function (req, res) {

    const deleteReason = req.body.why
    const name = req.user.username

    Owner.findById({ _id: req.params.ownerId }, function (err, owner) {
        if (!err) {
            if (owner) {
                const newDeletedOwner = new DeletedOwner({
                    name: owner.name,
                    nationalId: owner.nationalId,
                    nextPayment: owner.nextPayment,
                    amount: owner.amount,
                    amountPerMonth: owner.amountPerMonth,
                    category: owner.category,
                    note: deleteReason
                })
                newDeletedOwner.save(err => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Added user to deleted list collection.")
                        Owner.deleteOne({ _id: req.params.ownerId }, function (err) {
                            if (!err) {
                                console.log("Removed user from owners collection.")
                            }

                        })
                        Owner.find({ name: newDeletedOwner.name }, function (err, owners) {
                            if (!err) {
                                if (owners.length != 0) {
                                    res.render('owner', { owners: owners })
                                } else {
                                    res.redirect('/deletedList')
                                }
                            } else {
                                res.redirect('/data')
                            }
                        })
                    }
                })
                
            }
        }
        
    })
    
    

})

app.get('/deletedList', function (req, res) {
    if (req.isAuthenticated()) {
        const dOwners = []
        DeletedOwner.find({}, function (err, ownersFound) {
            if (!err) {
                if (ownersFound) {
                    ownersFound.forEach(o => {
                        dOwners.push({
                            id: o.id,
                            name: o.name,
                            note: o.note,
                            who: req.user.username
                        })
                    })
                    res.render('deletedList', { owners: dOwners })
                }
            } else {
                console.log(err)
            }

        })


    } else {
        console.log("Not authorized")
        res.redirect('/login')
    }
})

app.post('/restore', function (req, res) {
    if (req.isAuthenticated()) {
        DeletedOwner.findById({ _id: req.body.ownerId }, async function (err, owner) {
            if (!err) {
                if (owner) {
                    const newOwner = new Owner({
                        name: owner.name,
                        nationalId: owner.nationalId,
                        nextPayment: owner.nextPayment,
                        amount: owner.amount,
                        amountPerMonth: owner.amountPerMonth,
                        category: owner.category,
                        note: "كان محزوف و لسه راجع"
                    })
                    newOwner.save(err => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully added user back to owners collection.");
                            DeletedOwner.deleteOne({ _id: req.body.ownerId }, function (err) {
                                if (!err) {
                                    console.log("Successfully deleted user from deleted list collection.")
                                    res.redirect('/deletedList')
                                }
                            })
                        }
                    })

                }
            } else {
                console.log(err)
                res.redirect('/data')
            }
        })
    } else {
        res.redirect('/login')
    }



})

app.post('/deleteForever', function (req, res) {
    const ownerId = req.body.ownerIdToBeDeleted;
    DeletedOwner.deleteOne({ _id: ownerId }, function (err) {
        if (!err) {
            console.log("Successfully Deleted users from DB.\nThis user info cannot be restored")
            res.redirect('/deletedList')
        }
    })
})

app.post('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/')
        }
    });
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully.");
});