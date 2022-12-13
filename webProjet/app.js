require("dotenv").config();
require("./config/database").connect();
const cors = require('cors');
var bcrypt = require('bcryptjs');
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
const stripe= require("stripe")(process.env.STRIPE_KEY);
const Joi = require("joi");
const sendEmail = require("./utils/sendEmail");
const Token = require("./model/token");
const crypto = require("crypto");
const google= require("googleapis");

//******************************************** */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
app.use(express.json());
var corsOptions = {
  origin: "http://localhost:4200"
};
app.use(cors(corsOptions));
const auth = require("./middleware/auth");
const adminVerif = require("./middleware/adminVerif");

// importing Models
const Account = require("./model/account");
const User = require("./model/user");
const Product= require("./model/product");
const Cart = require("./model/cart");
const Order= require("./model/order");
const Commentaire= require("./model/commenatire")
const { token } = require("morgan");
const { Console } = require("console");

  app.post("/register", async (req, res) => {
    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, email, password } = req.body;
  
      // Validate user input
      if (!(first_name && last_name && email && password)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email});
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email,isAdmin:user.isAdmin },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email
            ,isAdmin:user.isAdmin },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  //############################ Crud User + Verification token ##########################
  app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });
  app.get('/users', async(req,res)=>{
      try{
        await User.find({}).then(result=>{
          res.send(result)
        })
      }
      catch(err){
        console.log(err)
      }
  })
  app.delete("/supprimer/:id",async(req,res)=>{
      try{
          await User.findOneAndDelete()
          res.send("supprimé avec succès")
         
      }
      catch(err){
          console.log(err);
      }
 
  });
  app.put("/update/:id",auth,async(req,res)=>{
    if (req.body.password){
      req.body.password= await bcrypt.hash(password, 10);
    }
    try{
      const updateUser=await User.findOneAndUpdate(req.params.id,{
        $set:req.body
      },{new:true}
      );
      res.status(200).json(updateUser);
    }
    catch(err){
      console.log("error")
      res.status(500).json(err);
    }
  });
  app.delete("/delete/:id",adminVerif,async(req,res)=>{
    try {
      console.log("e")
      console.log(req.user.isAdmin)
      await User.findOneAndDelete(req.params.id)
      console.log(req.user.isAdmin,"deleted")
      res.send("supprimé avec succès")

    } catch (error) {
      res.status(500).json(error);   
    }
  });
  //GET USER 
  app.get("/find/:id",adminVerif,async(req,res)=>{
    try {
       const user=await User.findById(req.params.id)
       res.status(200).json(user);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  })
  //GET  ALL + verif
  app.get("/",adminVerif,async(req,res)=>{
    const query= req.query.new;
    try {
       const users= query 
       ?await User.find().sort({createdAt:-1})
       : await User.find();
       res.status(200).json(users);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  })
  //Get user stats Tot user per /month
  app.get("/stats",adminVerif,async(req,res)=>{
    const date= new Date();
    const lastYear= new Date(date.setFullYear(date.getFullYear() - 1));
    try {
      const data = await User.aggregate([
          { $match :{createdAt:{$gte: lastYear}}},
          {
            $project:{
            month:{$month : "$createdAt"},
          },
        },
        {
          $group:{
            _id:"$month",
            total_user:{$sum :1},
          },
        }
        ]);
       console.log(lastYear)
       res.status(200).json(data);
    
    } catch (error) {
      console.log("fd")
      res.status(500).json(error);
      
    }
  }) 
  
  //################################ Crud Produit #####################################
  app.post("/createProduct", adminVerif, async(req, res) => {
    const newProduct=new Product(req.body)
    try {
      const savedProduct= await newProduct.save()
      res.status(200).json(savedProduct);
    } catch (error) {
      res.status(500).json(error);
    }
    
  });
  app.put("/updateProduct/:id",auth,async(req,res)=>{
    try{
      const updateProduct=await Product.findOneAndUpdate(req.params.id,{
        $set:req.body
      },{new:true}
      );
      res.status(200).json(updateProduct);
    }
    catch(err){
      console.log("error")
      res.status(500).json(err);
    }
  });
  app.delete("/deleteProduct/:id",adminVerif,async(req,res)=>{
    try {
      console.log(req.user.isAdmin)
      await Product.findOneAndDelete(req.params.id)
      console.log(req.user.isAdmin,"deleted")
      res.send("supprimé avec succès")

    } catch (error) {
      res.status(500).json(error);   
    }
  });
  //Get Product BY id
  app.get("/find/:id",async(req,res)=>{
    try {
       const product=await Product.findById(req.params.id)
       res.status(200).json(product);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  })
  app.get("/allProduct",async(req,res)=>{
    const query= req.query.new;
    const qCategory= req.query.category;
    try {
      let products;
      if(query){
        //http://localhost:4001/allProduct?new=true
        products= await Product.find().sort({createdAt: -1}).limit(5);
      }else if (qCategory){
         //http://localhost:4001/allProduct?category=man
        products= await Product.find({
          categories:{
          $in:[qCategory],
        },
      });
      }
      else{
        products= await Product.find();
      }
      
       res.status(200).json(products);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  });
  app.put("/updateProduct/:id",auth,async(req,res)=>{
    try{
      const updateProduct=await Product.findOneAndUpdate(req.params.id,{
        $set:req.body
      },{new:true}
      );
      res.status(200).json(updateProduct);
    }
    catch(err){
      console.log("error")
      res.status(500).json(err);
    }
  });
  //*********************************** CART************* */
  app.post("/createCart", adminVerif, async(req, res) => {
    const newCart=new Product(req.body)
    try {
      const savedCart= await newCart.save()
      res.status(200).json(savedCart);
    } catch (error) {
      res.status(500).json(error);
    }
    
  });
  app.put("/updateCart/:id",auth,async(req,res)=>{
    try{
      const updateCart=await Cart.findOneAndUpdate(req.params.id,{
        $set:req.body
      },{new:true}
      );
      res.status(200).json(updateCart);
    }
    catch(err){
      console.log("error")
      res.status(500).json(err);
    }
  });
  app.delete("/deleteCart/:id",adminVerif,async(req,res)=>{
    try {Cart
      console.log(req.user.isAdmin)
      await Cart.findOneAndDelete(req.params.id)
      console.log(req.user.isAdmin,"deleted")
      res.send("supprimé avec succès")

    } catch (error) {
      res.status(500).json(error);   
    }
  });
  app.get("/findCart/:id",async(req,res)=>{
    try {
       const carts=await Cart.findById(req.params.id)
       res.status(200).json(carts);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  })
  //*********************** Order CRUD *******/
  app.post("/createOrder", adminVerif, async(req, res) => {
    const newOrder=new Order(req.body)
    try {
      const savedOrder= await newOrder.save()
      res.status(200).json(savedOrder);
    } catch (error) {
      res.status(500).json(error);
    }
    
  });
  app.put("/updateOrder/:id",adminVerif,async(req,res)=>{
    try{
      const updateOrder=await Order.findOneAndUpdate(req.params.id,{
        $set:req.body
      },{new:true}
      );
      res.status(200).json(updateOrder);
    }
    catch(err){
      console.log("error")
      res.status(500).json(err);
    }
  });
  app.delete("/deleteOrder/:id",adminVerif,async(req,res)=>{
    try {Order
      console.log(req.user.isAdmin)
      await Order.findOneAndDelete(req.params.id)
      console.log(req.user.isAdmin,"deleted")
      res.send("supprimé avec succès")

    } catch (error) {
      res.status(500).json(error);   
    }
  });
  //get user orders
  app.get("/findOrder/:id",async(req,res)=>{
    try {
       const orders=await Order.find(req.params.id)
       res.status(200).json(orders);
    
    } catch (error) {
      res.status(500).json(error);
      
    }
  });
  //get all order
  app.get("/allOrders", adminVerif,async(req,res)=>{
    try{
      const orders= await Order.find();
      res.status(200).json(orders);
    }
    catch(err){
      res.status(500).json(err);
    }
  });
  //GET MONTHLY INCOMES "admin"
  app.get("/incomes",adminVerif,async(req,res)=>{
    const date= new Date();
    const lastMonth= new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth= new Date(date.setMonth(lastMonth.getMonth()-1))
    try {
      const income = await Order.aggregate([
          { $match :{createdAt:{$gte: previousMonth}}},
          {
            $project:{
            month:{$month : "$createdAt"},
            sales:"$amount",
          },
        },
        {
          $group:{
            _id:"$month",
            total_sales:{$sum :"$sales"},
          },
        }
        ]);
        res.status(200).json(income);
    } catch (error) {
      res.status(500).json(error);     
    }
  }) 
  //*************************************** payements */
  app.post("/checkout",async(req,res)=>{
    console.log(req.body.token.id)
    const customer=stripe.customers
    stripe.charges.create(
    {
      source:req.body.token.id,
      amount:1000,
      currency:"usd",
      customer:customer.id
    },
    (stripeErr,stripeRes)=>{
      if(stripeErr){
        console.log('failed')
        res.status(500).json(stripeErr);
        console.log('error',stripeErr)
      }else{
        console.log("sucess")
        res.status(200).json(stripeRes);
      }
    }
    );
  });/*console.log("check")
  try{
    console.log("try .....")
    token = req.body.tokenID;
    console.log("token ")
    console.log(token)
    const customer=stripe.customers
    .create({
      email:"oumaymabenamarti12@gmail.com",
      source: token.id,
      capture:false,
    })
    .then((customer)=>{
  
      console.log(customer);
      return stripe.charges.create({
        amount:1000,
        description:"e commerce",
        currency: "usd",
        customer:customer.id,
      });
    })
    .then((charge)=>{
      console.log(charge);
      res.json({
        data:"success",
      });
    }).catch((err)=>{
  
      res.json({
        data:"failure"
      })
  });
  return true;
  }catch(error){
    res.status(500).json(error); 
    return false;
  }
  });*/
  //**************Account******************* */

  app.post("/account", async (req, res) => {
    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, pseudo,email} = req.body;
  
      // Validate user input
      if (!(first_name && last_name && pseudo && email)) {
        res.status(400).send("All input is required");
      }
      // check if account already exist
      // Validate if account exist in our database
      const oldAccount = await Account.findOne({ email, pseudo});
      if (oldAccount) {
        return res.status(409).send("Account Already Exist.");
      }
      const user = await User.findOne({ email });
      if (user){
        return res.status(409).send("user Already Exist.");
      }
      // Create account in our database
      const account = await Account.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        pseudo:pseudo.toLowerCase(),
      });
      // return new account
      res.status(201).json(account);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
////************************************************************************************** */
  app.post("/passwordReset", async (req, res) => {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");
        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }
        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);
        res.send("password reset link sent to your email account");
        console.log(link)
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
});// /password-reset
app.post("/password-reset", async (req, res) => {
  console.log(req.body);
  try {
    console.log('test')
     const user = await User.findById(req.body.userId);
     if (!user) return res.status(400).send("invalid link or expired");
     console.log('test')
     const token = await Token.findOne({
        userId: user._id,
     });
     if (!token) return res.status(400).send("Invalid link or expired");

      user.password = req.body.password;
    
      encryptedPassword = await bcrypt.hash(password, 10);
     await user.save();
     await token.delete();

      res.send("password reset sucessfully.");
} catch (error) {
    res.send("An error occured");
    console.log(error);
}
});
////****************************Commentaires*************************//
app.post("/createCommentaire", async(req, res) => {
  const newCommentaire=new Commentaire(req.body)
  try {
    const savedCommentaire= await newCommentaire.save()
    res.status(200).json(savedCommentaire);
  } catch (error) {
    res.status(500).json(error);
  }
});
app.get("/allCommentaires",async(req,res)=>{
  try{
    const commentaires= await Commentaire.find();
    res.status(200).json(commentaires);
  }
  catch(err){
    res.status(500).json(err);
  }
});
app.get("/CommentaireNumber",async(req,res)=>{
  try{
    const commentaires= await Commentaire.find().count();
    res.status(200).json(commentaires);
  }
  catch(err){
    res.status(500).json(err);
  }
});
//db.student.find().count()
module.exports = app;