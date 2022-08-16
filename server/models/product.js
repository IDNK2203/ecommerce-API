const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: [true, "A Product must have a title"],
    trim: true,
    maxLength: [40, "A tour must have a more 40 characters"],
    minLength: [10, "A tour must have a least 10 characters"],
  },
  slug: String,
  color: {
    type: [String],
    required: [true, "A Product must have a color"],
  },
  coverImage: {
    type: String,
  },
  RAM: {
    type: Number,
  },
  price: {
    type: Number,
    required: [true, "A Product must have a price"],
  },
  model: {
    type: String,
    required: [true, "A Product must have a model"],
  },
  summary: {
    type: String,
    required: [true, "A Product must have a summary"],
    trim: true,
  },
  desc: {
    type: String,
  },
  images: [String],
  brand: {
    type: String,
    required: [true, "A Product must have a brand"],
  },
  weight: {
    type: mongoose.Types.Decimal128,
  },
});
module.exports = mongoose.model("product", productSchema);
