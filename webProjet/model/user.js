const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null, max:54 , required:true},
  last_name: { type: String, default: null , required:true},
  email: { type: String, unique: true  ,required:true},
  password: { type: String , required:true},
  token: { type: String},	
  isAdmin:{type:Boolean,default:false},
  restLink:{
    default:''
  }
},
{
  timestamps: true,
}
);


module.exports = mongoose.model("user", userSchema);