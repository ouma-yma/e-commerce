const express = require('express');
const app = express();
const CartRoute = express.Router();
// Employee model
let Item = require('../model/item');
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