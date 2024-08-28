const User = require("../models/userModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
require("dotenv").config();
const { joiRegisterSchema, joiLoginSchema } = require("../models/joiValidate");

// User Registration
exports.register = async (req, res) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "failed", message: error.details[0].message });
    }
    const { username, email, password } = req.body;
    console.log("register: ", username, email, password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// User/Admin Login
exports.login = async (req, res) => {
  console.log(req.body);

  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Define admin credentials
    const ADMIN_KEY = process.env.ADMIN_KEY;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Check if the email and password match the admin credentials
    if (email === ADMIN_KEY && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
      res.cookie('isAdmin', 'true', { httpOnly: true, maxAge: 3600000 }); // 1 hour


      return res.status(200).json({
        token,
        user: { isAdmin: true, email: ADMIN_KEY }, 
      });
    }

    // Regular user login
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email or password doesn't match" });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1D" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
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
    // console.log(productId);

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
    // console.log('addtocart:', userId, productId);
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingProduct = cart.products.find((p) =>
        p.productId.equals(productId)
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }
      await cart.save();
    } else {
      const newCart = new Cart({
        userId,
        products: [{ productId, quantity: 1 }],
      });
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
    console.log("getcartitem id : ", userId);

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decrease Quantity of a Cart Product
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    console.log("removecart: ", userId, productId);

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

    const product = cart.products[productIndex];

    // Decrease the quantity if it's greater than 1
    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      // Otherwise, remove the product from the cart
      cart.products.splice(productIndex, 1);
    }

    await cart.save();

    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a single product from the cart
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    console.log("deletecart: ", userId, productId);

    // Find the cart by userId
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product removed from cart successfully" });
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

// Order section
// exports.createOrder = async (req, res) => {
//   const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });

//   try {
//     const { userId } = req.body;
//     const cart = await Cart.findOne({ userId }).populate("products.productId");

//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({ message: "Cart is empty or not found" });
//     }

//     // Calculate total price and ensure it's an integer
//     const totalPrice = Math.round(
//       cart.products.reduce(
//         (acc, item) => acc + item.productId.price * item.quantity,
//         0
//       )
//     );

//     const totalItems = cart.products.length;
//     const totalQuantity = cart.products.reduce(
//       (acc, item) => acc + item.quantity,
//       0
//     );

//     // Create a Razorpay order
//     const options = {
//       amount: totalPrice * 100,
//       currency: "INR",
//       receipt: `receipt_order_${Date.now()}`,
//       payment_capture: 1,
//     };

//     const razorpayOrder = await razorpayInstance.orders.create(options);
//     console.log("Razorpay order:", razorpayOrder);

//     if (!razorpayOrder) {
//       return res.status(500).json({ message: "Error creating Razorpay order" });
//     }

//     const newOrder = new Order({
//       userId,
//       Products: cart.products,
//       totalPrice,
//       totalItems,
//       totalQuantity,
//       purchaseDate: Date.now(),
//       orderId: razorpayOrder.id,
//       paymentStatus: "Pending",
//     });

//     await newOrder.save();

//     await Cart.findByIdAndDelete(cart._id);

//     res.status(201).json({
//       message: "Order created successfully",
//       order: newOrder,
//       razorpayOrderId: razorpayOrder.id,
//       razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error("Error in createOrder:", error);
//     res
//       .status(500)
//       .json({ message: error.message, error: "Can't create order" });
//   }
// };

// // order section
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpayOrderId } = req.body;
//     // console.log("body: " , razorpayOrderId);

//     const order = await Order.findOne({orderId: razorpayOrderId});
//     // console.log("verify: ", order);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     order.paymentStatus = "Completed";

//     await order.save();
//     return res.status(200).json({ message: "Payment verified", order });
//   } catch (error) {
//     console.error("Error in verifyPayment:", error);
//     res
//       .status(500)
//       .json({ message: error.message, error: "Can't verify payment" });
//   }
// };

// // cancel payment
// exports.cancelPayment = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findOne({ orderId: orderId });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.paymentStatus !== "Pending") {
//       return res.status(400).json({ message: "Cannot cancel completed payment" });
//     }

//     await Order.findOneAndDelete({ orderId: orderId });

//     const cart = new Cart({
//       userId: order.userId,
//       products: order.Products,
//     });

//     await cart.save();

//     return res.status(200).json({ message: "Order cancelled successfully and items restored to cart" });
//   } catch (error) {
//     console.error("Error in cancelPayment:", error);
//     res.status(500).json({ message: error.message, error: "Can't cancel order" });
//   }
// };

// // View Order Details
// exports.getOrderDetails = async (req, res) => {
//     try {
//       const { orderId } = req.params;

//       const order = await Order.findOne({ orderId, paymentStatus: "Completed" });

//       if (!order) {
//         return res.status(404).json({ message: "Order not found or payment is not completed" });
//       }

//       return res.status(200).json({ message: "Order retrieved successfully", order });
//     } catch (error) {
//       console.error("Error in getOrderIfCompleted:", error);
//       res.status(500).json({ message: error.message, error: "Can't retrieve order" });
//     }
//   };


exports.createOrder = async (req, res) => {
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { userId, name, place, phone, address } = req.body;
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }

    const totalPrice = Math.round(
      cart.products.reduce((acc, item) => acc + item.productId.price * item.quantity, 0)
    );

    const options = {
      amount: totalPrice * 100, 
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    const newOrder = new Order({
      userId,
      products: cart.products,
      totalPrice,
      totalItems: cart.products.length,
      totalQuantity: cart.products.reduce((acc, item) => acc + item.quantity, 0),
      purchaseDate: Date.now(),
      orderId: razorpayOrder.id,
      paymentStatus: 'Pending',
      userDetails: { name, place, phone, address },
    });

    await newOrder.save();
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    console.log('orderId: ', razorpayOrderId);
    console.log('paymentId: ', razorpayPaymentId);
    console.log('sign: ', razorpaySignature);
    
    
    

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: razorpayOrderId },
      { paymentStatus: 'Completed' },
      { new: true }
    );

    res.status(200).json({ message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  console.log('orderId from getOrderDetils: ', orderId);
  

  try {
    const order = await Order.findOne({ orderId, paymentStatus: "Completed" });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or payment is not completed" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res
      .status(500)
      .json({ message: error.message, error: "Can't retrieve order" });
  }
};
