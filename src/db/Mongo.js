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
  byWhom: String,
  index: Number,
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

const sequenceSchema = new mongoose.Schema({
  _id: { type: String, default: "ownerSchema_sequence" },
  sequence_value: { type: Number, default: 1 },
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("user", userSchema);
const Owner = new mongoose.model("owner", ownerSchema);
const DeletedOwner = new mongoose.model("deletedOwner", deletedOwnersSchema);
const Total = new mongoose.model("monthTotal", monthTotalSchema);
const Sequence = mongoose.model("Sequence", sequenceSchema);

module.exports = { User, Owner, DeletedOwner, Total, Sequence };