const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect(process.env.mongoUrl)




const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});
const ownerSchema = new mongoose.Schema({
  name: String,
  nationalId: Number,
  nextPayment: String,
  lastPayment: String,
  category: String,
  amount: Number,
  amountPerMonth: Number,
  note: String,
  byWho: String,
});

const deletedOwnersSchema = new mongoose.Schema({
  name: String,
  nationalId: Number,
  nextPayment: String,
  category: String,
  amount: Number,
  amountPerMonth: Number,
  note: String,
  byWho: String,
});

const monthTotalSchema = new mongoose.Schema({
  monthNumber: Number,
  monthTotal: Number,
  year: Number,
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('user', userSchema)
const Owner = new mongoose.model('owner', ownerSchema)
const DeletedOwner = new mongoose.model('deletedOwner', deletedOwnersSchema)
const Total = new mongoose.model('monthTotal', monthTotalSchema)

module.exports = { User, Owner, DeletedOwner, Total}