const router = require("express").Router();
const cartControllers = require("../controllers/cartControllers");
const authControllers = require("../controllers/authControllers");

router.use(authControllers.protect);
router.get("/", cartControllers.getCartItems);

router.delete("/empty-cart", cartControllers.emptyCart);
router.post("/", cartControllers.addItemToCart);

router.patch("/remove/:id", cartControllers.removeCartItem);
router.patch("/:id", cartControllers.updateCartItem);

module.exports = router;
