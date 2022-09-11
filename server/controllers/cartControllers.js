const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const payload = {
    price: req.body.price, // x
    productId: req.body.productId,
    title: req.body.title, // x
    summary: req.body.summary, // x
    quantity: 1,
    subTotal: req.body.price,
  };

  // check if the the user cart exists
  const user = await User.findById({ _id: userId });
  let { cartInfo: userCart } = user;

  const isCartEmpty =
    userCart &&
    Object.keys(userCart).length === 0 &&
    Object.getPrototypeOf(userCart) === Object.prototype;

  if (!isCartEmpty) {
    let cartItem = userCart.products.find(
      (el, i) => payload.productId == el.productId
    );
    if (!cartItem) {
      userCart.products.push(payload);
      user.markModified("cartInfo");
    } else {
      // send back an error
    }
  } else {
    const productsArray = [payload];
    userCart = {
      products: productsArray,
      // check if the user cart exists
    };
  }

  user.cartInfo = userCart;
  const _user = await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    cart: _user.cartInfo,
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  // TODO add check for if operation type was specified.
  const userId = req.user.id;
  const { id } = req.params;
  const payload = {
    quantity: req.body.quantity ? req.body.quantity : 1,
  };

  const user = await User.findById({ _id: userId });
  let { cartInfo: userCart } = user;

  let cartItem = await userCart.products.id(id);
  // TODO add check for if cart item doesn't exist.

  if (req.body.operationType === "increment") {
    user.cartInfo.products.id(id).quantity =
      payload.quantity === 1 ? cartItem.quantity + 1 : payload.quantity;
  } else if (req.body.operationType === "decrement") {
    user.cartInfo.products.id(id).quantity =
      payload.quantity === 1 ? cartItem.quantity - 1 : payload.quantity;
  }

  if (!user.cartInfo.products.id(id).quantity) {
    return next("route");
  }

  user.cartInfo.products.id(id).subTotal = cartItem.price * cartItem.quantity;

  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    cart: _user.cartInfo,
  });
});

exports.getCartItems = catchAsync(async (req, res, next) => {
  // _/
  const userId = req.user.id;
  // check if the the user cart exists
  const user = await User.findById({ _id: userId });
  let { cartInfo } = user;

  res.status(201).json({
    status: "success",
    cart: cartInfo,
  });
});

exports.removeCartItem = catchAsync(async (req, res, next) => {
  // _/
  const userId = req.user.id;
  const { id } = req.params;
  // check if the the user cart exists
  const user = await User.findById({ _id: userId });
  let { cartInfo: userCartCopy } = user;

  let cartItem = await userCartCopy.products.id(id).remove();

  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
  });
});

// add a empty cart controller
exports.emptyCart = catchAsync(async (req, res, next) => {
  // _/
  const userId = req.user.id;
  const { id } = req.params;
  // check if the the user cart exists
  const user = await User.findById({ _id: userId });
  user.cartInfo.products = [];

  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
  });
});
