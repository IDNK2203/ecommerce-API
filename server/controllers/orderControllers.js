const fetch = require("node-fetch");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const User = require("../models/user");
const Order = require("../models/order");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { v1: uuidv1 } = require("uuid");
const APIFeatures = require("../utils/APIFeatures");

exports.checkoutCartItems = catchAsync(async (req, res, next) => {
  const user = req.user;
  const body = {
    tx_ref: uuidv1(),
    amount: user.cartInfo.totalAmount,
    currency: "NGN",
    redirect_url: "https://example.com",
    meta: {
      consumer_id: user._id,
      consumer_mac: "92a3-912ba-1192a",
    },
    customer: {
      email: user.email,
      phonenumber: "080****4528",
      name: user.firstName + user.lastName,
    },
    customizations: {
      title: "Pied Piper Payments",
      logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
    },
  };

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
  });
  const data = await response.json();
  res.status(200).json({
    status: "success",
    data,
  });
});

exports.verifypaymentAfterCheckout = catchAsync(async (req, res, next) => {
  if (req.query.status === "successful") {
    const transactionDetails = await flw.Transaction.fetch({
      ref: req.query.tx_ref,
    });
    const response = await flw.Transaction.verify({
      id: req.query.transaction_id,
    });

    if (
      response?.data?.status === "successful" &&
      response?.data?.amount === transactionDetails.data[0].amount &&
      response.data.currency === "NGN"
    ) {
      const user = await User.findById({ _id: req.user._id });
      const { cartInfo } = user;
      if (cartInfo.products < 1) return next("route");
      const orderDocPayload = {
        customer: req.user._id,
        products: cartInfo.products,
        totalAmount: cartInfo.totalAmount,
        noOfProducts: cartInfo.noOfProducts,
        payment: {
          paymentId: req.query.tx_ref,
          transactionId: req.query.transaction_id,
        },
        isPaid: true,
        paidAt: Date.now(),
      };

      await Order.create(orderDocPayload);
      user.cartInfo.products = [];
      user.markModified("cartInfo");
      const _user = await user.save({ validateBeforeSave: false });
      res.status(200).json({
        status: "success",
        data: response.data,
      });
    } else {
      return next(new AppError("This card has been declined", 400));
    }
  } else {
    return next(new AppError("Your payment was successful", 400));
  }
});

exports.verifypayment = catchAsync(async (req, res, next) => {
  if (req.query.status === "successful") {
    const transactionDetails = await flw.Transaction.fetch({
      ref: req.query.tx_ref,
    });
    const response = await flw.Transaction.verify({
      id: req.query.transaction_id,
    });

    if (
      response?.data?.status === "successful" &&
      response?.data?.amount === transactionDetails.data[0].amount &&
      response.data.currency === "NGN"
    ) {
      res.status(200).json({
        status: "success",
        data: response.data,
      });
    } else {
      return next(new AppError("This card has been declined", 400));
    }
  } else {
    return next(new AppError("Your payment was successful", 400));
  }
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const AgQuery = new APIFeatures(Order.find(), req.query).filter().sort();
  const orders = await AgQuery.query.exec();
  res.status(200).json({
    status: "success",
    orders,
  });
});
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ customer: req.user._id });
  res.status(200).json({
    status: "success",
    orders,
  });
});
exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.find({
    customer: req.user._id,
    _id: req.params.orderId,
  });

  if (!order) return next(new AppError("This error could not be found", 404));
  res.status(200).json({
    status: "success",
    order,
  });
});

exports.getAnOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new AppError("This error could not be found", 404));
  res.status(200).json({
    status: "success",
    order,
  });
});

// https://example.com/?status=successful&tx_ref=7872e3b0-385e-11ed-b348-fffcdf887960&transaction_id=3750482
