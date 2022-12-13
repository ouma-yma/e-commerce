const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId
const CartSchema = new mongoose.Schema(
  {
    userId: {   type: mongoose.Schema.Types.ObjectId, /*required: 'Please enter your userId'*/ },
    products: [
      {
        productId: {
          type: String,
          required :true
        },
        quantity: {
          type: Number,
          default: 1,
          required :true
        },
      },
    ],
  },
  { timestamps: true }
);
    module.exports = mongoose.model("Cart", CartSchema);