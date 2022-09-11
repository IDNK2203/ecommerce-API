const router = require("express").Router();
const productControllers = require("../controllers/productControllers");
const authControllers = require("../controllers/authControllers");

router.use(authControllers.protect);

router.get("/", productControllers.getProducts);
router.get("/:id", productControllers.getAProduct);

router.post("/", productControllers.createProduct);
router.delete("/:id", productControllers.deleteProduct);
router.patch("/:id", productControllers.updateProduct);

module.exports = router;
