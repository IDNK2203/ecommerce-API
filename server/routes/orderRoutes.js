const router = require("express").Router();
const orderControllers = require("../controllers/orderControllers.js");
const authControllers = require("../controllers/authControllers");

router.use(authControllers.protect);

router.get("/verify-callback", orderControllers.verifypaymentAfterCheckout);
// add an authorization middleware, granting access to only admin.
router.get("/verify-callback", orderControllers.verifypayment);

router.get("/myorder/:orderId", orderControllers.getMyOrders);
router.get("/myorders", orderControllers.getMyOrders);
router.get("/:orderId", orderControllers.getAnOrder);
router.get("/", orderControllers.getAllOrders);
router.post("/checkout", orderControllers.checkoutCartItems);

module.exports = router;
