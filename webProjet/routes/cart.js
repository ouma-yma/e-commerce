const express = require('express');
const app = express();
const CartRoute = express.Router();
// Employee model
let Cart = require('../model/cart.js');
// Add Employee
CartRoute.route('/cart').post((req, res, next) => {
  Cart.create(req.body, (error, data) => {
    if (error) {
      return next(error)
      
    } else {
      res.json(data)
    }
  })
});
module.exports = CartRoute;