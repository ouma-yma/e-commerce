const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  pseudo:{type:String, unique:true},
  email: { type: String, unique: true }
},
{
  timestamps: true,
}
);


module.exports = mongoose.model("account", accountSchema);