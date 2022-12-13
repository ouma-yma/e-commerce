const mongoose = require("mongoose");

const commentaireSchema = new mongoose.Schema({
  name: { type: String, default: null, max:54 , required:true, unique:true},
  email: { type: String, unique: true  ,required:true},
  review: { type: String, required:true, max:500 , min:20},	
},
{
  timestamps: true,
}
);


module.exports = mongoose.model("commentaire", commentaireSchema);