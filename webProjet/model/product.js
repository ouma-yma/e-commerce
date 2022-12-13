const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  title: { type: String ,required: true , unique:true},
  desc: { type: String,required:true },
  img: { type: String, required:true },
  categories: { type : Array,required:true },
  size:[
      {
        sizeId:{
          type:String,
        },
        quanity:{
          type:Number,
          default:0,
        }
      }
   ],    
  color: { type: String,required:true  },
  price: { type: Number, required:true },
  weight:{type: String,required:true},
  materials:{type: String,required:true},
  dimensions:{type: String,required:true},
},{timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);       