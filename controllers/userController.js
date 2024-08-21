const User = require("../models/userModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { joiRegisterSchema, joiLoginSchema } = require('../models/joiValidate')
// User Registration
exports.register = async (req, res) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: "failed", message: error.details[0].message });
    }
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed",  message: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "email or password error" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// View Products by Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View a Specific Product
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Product to Cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await Cart.findOne({ userId });
    // console.log(cart);
    

    if (cart) {
      const existingProduct = cart.products.find((p) =>
        p.productId.equals(productId)
      );
      if (existingProduct) {
        return res.status(400).json({ message: "Product already in cart" });
      }
      cart.products.push({ productId });
      await cart.save();
    } else {

      const newCart = new Cart({ userId, products: [{ productId }] });
      await newCart.save();
    }

    res.status(201).json({ message: "Product added to cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Cart Items
exports.getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a cart product for user
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart for user
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Cart Item Quantity
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const product = cart.products.find((p) => p.productId.equals(productId));
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    product.quantity = quantity;
    await cart.save();

    res
      .status(200)
      .json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      const productExists = wishlist.products.some((p) => p.equals(productId));

      if (productExists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      wishlist.products.push(productId);
    } else {
      wishlist = new Wishlist({ userId, products: [productId] });
    }

    await wishlist.save();

    res.status(201).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get wishlist items
exports.getWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    res.status(200).json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// order for user
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    const totalPrice = cart.products.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );

    const totalItems = cart.products.length;
    const totalQuantity = cart.products.reduce((acc, item) => acc + item.quantity, 0);
    // console.log(totalQuantity);
    

    const newOrder = new Order({
      userId, 
      Products: cart.products, 
      totalPrice,
      totalItems,
      totalQuantity,
      orderId: `orderId-${Date.now()}`, 
    });

    await newOrder.save();

    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message, error: "can't order" });
  }
};


// View Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    // console.log("Order ID", orderId);

    const order = await Order.findById(orderId).populate("Products.productId");
    // console.log("order:", order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

