const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const passport = require("passport");
var favicon = require("serve-favicon");
const LoginRoute = require("./routes/Login");
const RegisterRoute = require("./routes/Register");
const date = require("./date");
const db = require("./db/Mongo");
const Owner = db.Owner;
const DeletedOwner = db.DeletedOwner;
const Total = db.Total;
const Sequence = db.Sequence;

var app = express();
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(
  session({
    cookie: { maxAge: 86400000 },
    secret: process.env.secret,
    resave: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(favicon(__dirname + "/public/images/favicon.ico"));

app.use("/login", LoginRoute);
app.use("/register", RegisterRoute);

app.get("/", function (req, res) {
  res.render("index");
});

app
  .route("/data")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      let owners = [];
      Owner.find({}, function (err, o) {
        if (!err) {
          o.forEach((owner) => {
            owners.push(owner.name);
          });
          res.render("data", {
            owners: owners,
          });
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post(function (req, res) {
    if (req.isAuthenticated()) {
      ownerName = req.body.name;

      if (date.isInteger(ownerName)) {
        Owner.findOne({ index: parseInt(ownerName) }, (err, owner) => {
          if (err) {
            res.redirect("/data");
          } else {
            var name = encodeURIComponent(owner.name);
            res.redirect("/owner?name=" + name);
          }
        });
      } else if (ownerName == "" || ownerName == null) {
        res.redirect("/data");
      } else if (ownerName === "TOTAL") {
        res.redirect("/total");
      } else {
        var string = encodeURIComponent(ownerName);
        res.redirect("/owner?name=" + string);
      }
    } else {
      res.redirect("/login");
    }
  });

app.get("/allOwners", function (req, res) {
  if (req.isAuthenticated()) {
    Owner.find({}, function (err, owners) {
      res.render("allOwners", { owners: owners });
    });
  } else {
    res.redirect("/login");
  }
});

app
  .route("/add")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render("add");
    } else {
      res.redirect("/login");
    }
  })
  .post(function (req, res) {
    // Find the next sequence value and assign it to the 'index' field
    Sequence.findOneAndUpdate(
      { _id: "ownerSchema_sequence" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
      function (err, sequence) {
        if (err) {
          console.error("Error generating sequence:", err);
          return res.redirect("/data");
        }

        const newOwner = new Owner({
          name: req.body.name.trim(),
          nationalId: req.body.nationalId,
          nextPayment: req.body.nextPayment,
          amount: req.body.amount,
          amountPerMonth: req.body.amountPerMonth,
          category: req.body.category,
          note: req.body.note,
          byWhom: req.user.username,
          index: sequence.sequence_value,
        });

        newOwner.save((err) => {
          if (err) {
            console.error("Error saving new owner:", err);
            return res.redirect("/data");
          }

          var string = encodeURIComponent(newOwner.name);
          res.redirect("/owner?name=" + string);
        });
      }
    );
  });

app
  .route("/owner")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      const searchWords = req.query.name.split(" ");
      const regexPattern = new RegExp(
        searchWords.map((word) => `(?=.*${word})`).join(""),
        "iu"
      );

      // regex function to get all documents containing the user input
      Owner.find({ name: { $regex: regexPattern } }, function (err, owners) {
        if (!err) {
          if (owners.length !== 0) {
            res.render("owner", { owners: owners });
          } else {
            res.redirect("/data");
          }
        } else {
          res.redirect("/data");
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post(async function (req, res) {
    if (req.body.where === "allOwnersPost") {
      Owner.findById({ _id: req.body.id }, function (err, owner) {
        if (!err) {
          res.render("owner", { owners: [owner] });
        }
      });
    } else {
      let amount = 0;
      let owner = await Owner.findOne({ _id: req.body.ownerId });
      const nextPayment = owner.nextPayment;

      if (!owner) {
        res.redirect("/data");
      } else {
        // Calculating new date

        if (typeof req.body.monthCount != "undefined") {
          amount = owner.amountPerMonth * req.body.monthCount;
          var newDate = date.updateSDate(
            nextPayment,
            Number(req.body.monthCount)
          );
        } else {
          amount = owner.amount;
          var newDate = date.updateDate(nextPayment);
        }
      }

      await Owner.findOneAndUpdate(
        { _id: req.body.ownerId },
        {
          $set: {
            nextPayment: newDate,
            lastPayment: date.getLastPaymentDate(),
            byWhom: req.user.username,
          },
        }
      );

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const month = await Total.findOne({
        monthNumber: currentMonth,
        year: currentYear,
      });

      if (!month) {
        const newMonth = new Total({
          monthNumber: currentMonth,
          monthTotal: parseInt(amount),
          year: currentYear,
        });
        newMonth.save(() => {
          res.redirect("/data");
        });
      } else {
        month.monthTotal += parseInt(amount);
        month.save().then(() => {
          res.redirect("/data");
        });
      }
    }
  });

app.post("/addNote", async (req, res) => {
  const note = req.body.note;
  const id = req.body.id;
  await Owner.findOneAndUpdate({ _id: id }, { note: note });
  res.redirect("back");
});

app
  .route("/edit/:ownerId")
  .get(function (req, res) {
    const ownerId = req.params.ownerId;
    Owner.findById(ownerId, function (err, owner) {
      res.render("edit", { owner: owner });
    });
  })
  .post(function (req, res) {
    Owner.updateOne(
      { _id: req.params.ownerId },
      {
        $set: {
          name: req.body.name.trim(),
          nationalId: req.body.nationalId,
          nextPayment: req.body.nextPayment,
          amount: req.body.amount,
          amountPerMonth: req.body.amountPerMonth,
          category: req.body.category,
          note: req.body.note,
        },
      },
      function (err, result) {
        if (!err) {
          var string = encodeURIComponent(req.body.name.trim());
          res.redirect("/owner?name=" + string);
        } else {
          res.redirect("/data");
        }
      }
    );
  });

app
  .route("/total")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      Total.find({}, function (err, total) {
        if (!err) {
          const transformed = {};

          total.forEach((item) => {
            const year = item.year;
            const month = item.monthNumber;
            const totalVal = item.monthTotal;

            if (!transformed[year]) {
              transformed[year] = {};
            }

            transformed[year][month] = totalVal;
          });

          console.log(transformed);

          res.render("total", { total: transformed });
        } else {
          res.redirect("/data");
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post(function (req, res) {
    const totalDiff = Number(req.body.totalDiff);
    let id = req.body.id.filter((id) => {
      return id != "";
    });
    id = id[0];

    Total.findById(id, function (err, month) {
      if (!err) {
        month.monthTotal += totalDiff;
        month.save(() => {
          res.redirect("/total");
        });
      } else {
        res.redirect("/total");
      }
    });
  });

app.post("/delete/:ownerId", function (req, res) {
  const deleteReason = req.body.why;
  const name = req.user.username;

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
          note: deleteReason,
          byWhom: name,
        });
        newDeletedOwner.save((err) => {
          if (err) {
            res.redirect("back");
          } else {
            Owner.deleteOne({ _id: req.params.ownerId }, function (err) {
              if (!err) {
                Owner.find(
                  { name: newDeletedOwner.name },
                  function (err, owners) {
                    if (!err) {
                      if (owners.length > 0) {
                        var string = encodeURIComponent(newDeletedOwner.name);
                        res.redirect("/owner?name=" + string);
                      } else {
                        res.redirect("/deletedList");
                      }
                    } else {
                      res.redirect("/data");
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  });
});

app.get("/deletedList", function (req, res) {
  if (req.isAuthenticated()) {
    DeletedOwner.find({}, function (err, ownersFound) {
      if (!err) {
        if (ownersFound) {
          // const deleted = ownersFound.filter((o) => {
          //     return {id: o.id, name: o.name, note: o.note, who: req.user.username}
          // })

          res.render("deletedList", { owners: ownersFound.reverse() });
        }
      } else {
        res.redirect("/deletedList");
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/restore", function (req, res) {
  if (req.isAuthenticated()) {
    Sequence.findOneAndUpdate(
      { _id: "ownerSchema_sequence" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
      function (err, sequence) {
        if (err) {
          console.error("Error generating sequence:", err);
          return res.redirect("/data");
        }
        DeletedOwner.findById(
          { _id: req.body.ownerId },
          async function (err, owner) {
            if (!err) {
              if (owner) {
                const newOwner = new Owner({
                  index: sequence.sequence_value,
                  name: owner.name,
                  nationalId: owner.nationalId,
                  nextPayment: owner.nextPayment,
                  amount: owner.amount,
                  amountPerMonth: owner.amountPerMonth,
                  byWhom: req.user.username,
                  category: owner.category,
                  note: "كان محزوف و لسه راجع",
                });
                newOwner.save((err) => {
                  if (err) {
                    res.redirect("/deletedList");
                  } else {
                    DeletedOwner.deleteOne(
                      { _id: req.body.ownerId },
                      function (err) {
                        if (!err) {
                          res.redirect("/deletedList");
                        }
                      }
                    );
                  }
                });
              }
            } else {
              res.redirect("/data");
            }
          }
        );
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.post("/deleteForever", function (req, res) {
  const ownerId = req.body.ownerIdToBeDeleted;
  DeletedOwner.deleteOne({ _id: ownerId }, function (err) {
    if (!err) {
      res.redirect("/deletedList");
    }
  });
});

app.post("/logout", function (req, res) {
  req.logout(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 7860;
}

app.listen(port, function () {
  console.log("Server has started successfully.");
});
