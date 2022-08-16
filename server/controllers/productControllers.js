const Product = require("../models/product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createProduct = catchAsync(async (req, res, next) => {
  const payload = { ...req.body };
  const product = await Product.create(payload);
  res.status(201).json({
    status: "success",
    product,
  });
});

exports.getProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({});
  res.status(200).json({
    status: "success",
    products,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("the product was not found", 404));
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const productCheck = await Product.findById(req.params.id);

  if (!productCheck)
    return next(new AppError("the product was not found", 404));
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  console.log(product);
  res.status(201).json({
    status: "success",
    product,
  });
});

exports.getAProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    status: "success",
    product,
  });
});
