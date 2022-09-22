const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  noOfProducts: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  payment: {
    transactionId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
  },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "product" },
      title: {
        type: String,
      },
      price: {
        type: Number,
      },
      summary: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      subTotal: {
        type: Number,
      },
    },
  ],
});

orderSchema.pre(/^find/, function (next) {
  this.populate("customer", "firstName lastName email");
  next();
});

module.exports = mongoose.model("order", orderSchema);
