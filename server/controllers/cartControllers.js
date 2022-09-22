const User = require("../models/user");
const Product = require("../models/product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const reqpPayload = {
    productId: req.body.productId,
    quantity: 1,
  };

  const user = await User.findById({ _id: userId });
  const { title, summary, price } = await Product.findById({
    _id: reqpPayload.productId,
  });
  const payload = { ...reqpPayload, title, summary, price, subTotal: price };

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
      return next(new AppError("Wrong route, try the update cart route"));
    }
  } else {
    userCart = {
      products: [payload],
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
  if (!req.body.operationType && !req.body.quantity) {
    return next(new AppError("Please specify operation Type or quantity"));
  }
  const userId = req.user.id;
  const { id } = req.params;
  const user = await User.findById({ _id: userId });
  let { cartInfo: userCart } = user;
  let cartItem = userCart.products.id(id);

  if (!cartItem) {
    return next(new AppError("This product could not be found in cart", 404));
  }

  if (req.body.quantity) {
    user.cartInfo.products.id(id).quantity =
      1 < req.body.quantity && req.body.quantity <= 10 ? req.body.quantity : 10;
  } else {
    user.cartInfo.products.id(id).quantity =
      req.body.operationType === "increment"
        ? cartItem.quantity + 1
        : req.body.operationType === "decrement"
        ? cartItem.quantity - 1
        : cartItem.quantity;
  }

  if (!user.cartInfo.products.id(id).quantity) {
    let cartItem = await user.cartInfo.products.id(id).remove();
  } else {
    user.cartInfo.products.id(id).subTotal = cartItem.price * cartItem.quantity;
  }

  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    cart: _user.cartInfo,
  });
});

exports.getCartItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById({ _id: userId });
  let { cartInfo } = user;

  res.status(201).json({
    status: "success",
    cart: cartInfo,
  });
});

exports.removeCartItem = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const user = await User.findById({ _id: userId });
  let { cartInfo: userCartCopy } = user;

  let cartItem = userCartCopy.products.id(id);
  if (!cartItem) {
    return next(new AppError("This product could not be found in cart", 404));
  }
  await cartItem.remove();
  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
  });
});

// add a empty cart controller
exports.emptyCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;
  const user = await User.findById({ _id: userId });
  user.cartInfo.products = [];

  user.markModified("cartInfo");
  const _user = await user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
  });
});
