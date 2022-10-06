const fetch = require("node-fetch");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const User = require("../models/user");
const Order = require("../models/order");
const factory = require("../controllers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { v1: uuidv1 } = require("uuid");

const transactionChecks = (response, transactionDetails) => {
  return (
    response?.data?.status === "successful" &&
    response?.data?.amount === transactionDetails.data[0].amount &&
    response?.data?.currency === "NGN"
  );
};

const createOrder = async (req, next) => {
  const user = await User.findById({ _id: req.user._id });
  const { cartInfo } = user;
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
};

exports.checkoutCartItems = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user.cartInfo.products.length) {
    return next(new AppError("Add an Item to cart to checkout", 400));
  }
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
      name: user.fullName,
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
  if (!req.user.cartInfo.products.length) {
    return next(
      new AppError("Only admins can verify already created orders", 400)
    );
  }
  if (req.query.status === "successful") {
    const transactionDetails = await flw.Transaction.fetch({
      ref: req.query.tx_ref,
    });
    const response = await flw.Transaction.verify({
      id: req.query.transaction_id,
    });

    if (transactionChecks(response, transactionDetails)) {
      await createOrder(req, next);

      res.status(200).json({
        status: "success",
        data: response.data,
      });
    } else {
      return next(new AppError("This card has been declined", 400));
    }
  } else {
    return next(new AppError("Your payment was not successful", 400));
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

    if (transactionChecks(response, transactionDetails)) {
      res.status(200).json({
        status: "success",
        data: response.data,
      });
    } else {
      return next(new AppError("This card has been declined", 400));
    }
  } else {
    return next(new AppError("Your payment was not successful", 400));
  }
});

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new AppError(`No ${Order.constructor.modelName} found with that ID`, 404)
    );
  }
  console.log(order.customer.id, req.user.id);
  if (order.customer.id !== req.user.id)
    return next(
      new AppError("you cannot access another person's order information", 400)
    );

  res.status(200).json({
    status: "success",
    order,
  });
});

exports.getMyOrdersMW = (req, res, next) => {
  req.body.filter = { customer: req.user._id };
  next();
};
exports.getMyOrders = factory.getAll(Order);
exports.getAllOrders = factory.getAll(Order);
exports.getAnOrder = factory.getOne(Order);
