// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   Products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number }],
//   totalPrice: Number,
//   totalItems: Number,
//   totalQuantity: Number,
//   purchaseDate: { type: Date, default: Date.now },
//   orderId: { type: String, required: true, unique: true },
//   paymentStatus: { type: String, default: "Pending" },
//   paymentId: { type: String }
// });

// module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  orderId: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  userDetails: {
    name: { type: String, required: true },
    place: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

