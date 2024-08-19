const Users = require('../models/userModel')
const Products = require('../models/productModel')
const Orders = require('../models/orderModel')
const jwt = require('jsonwebtoken')


// admin login
exports.adminLogin = (req, res) => {
  const { email, password } = req.body

  const ADMIN_KEY = process.env.ADMIN_KEY
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  if (email === ADMIN_KEY && password === ADMIN_PASSWORD ) {
    const token = jwt.sign({isAdmin: true}, process.env.JWT_SECRET, {expiresIn: '1h'})

    return res.status(200).json({
      message: 'Admin Login Successfull',
      token : token
    })
  } else{
    return res.status(401).json({
      message: 'Invalid Credential', error: "usesr name or password did't match"
    }) 
  }
}


// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({},{password: 0})
    // console.log(users)
    res.status(200).json(users)
  } catch(error) {
    res.status(500).json({message: error, error: "users not found"})
  }
}


// Get user by Id
exports.getUserById = async (req, res) => {
  console.log(req.params);
  
  try {
    const { userId } = req.params
    console.log(userId);
    
    const user = await Users.findById(userId)
    console.log(user);
    
    if (!user) {
      res.status(404).json({message: "user not found"})
      res.status(200).json(user)
    }
  }catch (error) {
    res.status(500).json({message: error.message, error: "token not match"})
  }
}
