const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId
const orderSchema = new mongoose.Schema({
     userId:{type:String, required:true},
     products:[
      {
        productId:{
          type:String,
        },
        quality:{
          type:Number,
          default:1,
        },
        size:{
          type:Number,
          required:true,
        }, color:{
          type:String,
          required:true,
        }
      }
     ],
     amount:{type:Number, required:true},
     address:{type:Object, required:true},
     status:{type:String , default:"pending"},
    },
    {timestamps: true});
    module.exports = mongoose.model("Order", orderSchema);