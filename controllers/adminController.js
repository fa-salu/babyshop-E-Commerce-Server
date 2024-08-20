const Users = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");

// admin login
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  const ADMIN_KEY = process.env.ADMIN_KEY;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (email === ADMIN_KEY && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Admin Login Successfull",
      token: token,
    });
  } else {
    return res.status(401).json({
      message: "Invalid Credential",
      error: "usesr name or password did't match",
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({}, { password: 0 });
    // console.log(users)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error, error: "users not found" });
  }
};

// Get user by Id
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get all product
exports.getAllProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "product not found", error: error });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, image, category } = req.body;
    const newProduct = new Product({
      title,
      description,
      price,
      image,
      category,
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "product created successfully", newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, error: "product can't create" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      res.status(404).json({ message: "product not found" });
    }
    res.status(200).json({ message: "product delete successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, error: "product can't deleted" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, price, image, category } = req.body;
    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      { title, description, price, image, category },
      { new: true }
    );
    res.status(200).json({message: "product updated successfully", updateProduct})
  } catch (error) {
    res.status(500).json({message: error.message, error: "product can't updated"})
  }
};

// Get total quantity of products purchased across all orders
exports.getTotalProductsPurchased = async (req, res) => {
  try {
    const totalProductsPurchased = await Order.aggregate([
      // Group all documents together and sum up the totalQuantity field
      { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }
    ]);

    // Return the total quantity or 0 if no orders were found
    res.status(200).json({ totalQuantity: totalProductsPurchased[0]?.totalQuantity || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

