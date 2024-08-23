const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number }],
  totalPrice: Number,
  totalItems: Number,
  totalQuantity: Number,
  purchaseDate: { type: Date, default: Date.now },
  orderId: { type: String, required: true, unique: true },
  paymentStatus: { type: String, default: "Pending" },
  paymentId: { type: String }
});

module.exports = mongoose.model('Order', orderSchema);
