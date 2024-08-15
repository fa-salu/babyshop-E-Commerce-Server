const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
