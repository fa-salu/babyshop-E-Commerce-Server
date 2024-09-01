const Users = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
// const jwt = require("jsonwebtoken");
const { joiCreateProductSchema } = require("../models/joiValidate");
// admin login
// exports.adminLogin = (req, res) => {
//   const { email, password } = req.body;

//   const ADMIN_KEY = process.env.ADMIN_KEY;
//   const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

//   if (email === ADMIN_KEY && password === ADMIN_PASSWORD) {
//     const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     return res.status(200).json({
//       message: "Admin Login Successfull",
//       token: token,
//     });
//   } else {
//     return res.status(401).json({
//       message: "Invalid Credential",
//       error: "usesr name or password did't match",
//     });
//   }
// };

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({}, { password: 0 });
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


// Get product by id
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create product
exports.createProduct = async (req, res) => {
  try {
    const { error } = joiCreateProductSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { name, description, price, image, category, stars } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      stars
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
    const { name, description, price, image, category, stars } = req.body;
    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, image, category, stars },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "product updated successfully", updateProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, error: "product can't updated" });
  }
};

// Get total purchased quantity
exports.getTotalProductsPurchased = async (req, res) => {
  try {
    const totalProductsPurchased = await Order.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } },
    ]);

    res
      .status(200)
      .json({ totalQuantity: totalProductsPurchased[0]?.totalQuantity || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

// Get total revenue
exports.getTotalRevenue = async (req, res) => {
  try {
    // Aggregate total revenue
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    console.log('Total Revenue:', totalRevenue);

    // Aggregate revenue by month
    const monthlyRevenue = await Order.aggregate([
      { $group: { _id: { $month: "$purchaseDate" }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { "_id": 1 } },
      { $project: { month: { $dateToString: { format: "%B", date: { $dateFromParts: { year: { $year: new Date() }, month: "$_id" } } } }, revenue: 1, _id: 0 } }
    ]);
    console.log('Monthly Revenue:', monthlyRevenue);

    res.status(200).json({
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      monthly: monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};



// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.find();
    
    if (!order) {
      res.status(404).json({ message: "order details not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};


// Get order details by user
exports.getOrderDetailsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId, paymentStatus: "Completed" })
      .populate({
        path: 'products.productId',
        select: 'name description price image category stars' 
      });

    console.log('orders', orders);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Order details not found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};


