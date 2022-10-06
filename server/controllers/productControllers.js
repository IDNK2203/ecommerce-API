const Product = require("../models/product");
const factory = require("../controllers/handlerFactory");

exports.createProduct = factory.createOne(Product);
exports.getProducts = factory.getAll(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.getAProduct = factory.getOne(Product);
