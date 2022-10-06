const router = require("express").Router();
const orderControllers = require("../controllers/orderControllers.js");
const authControllers = require("../controllers/authControllers");

router.use(authControllers.protect);

router.get("/verify-payment-ck", orderControllers.verifypaymentAfterCheckout);
// add an authorization middleware, granting access to only admin.
router.get("/verify-payment", orderControllers.verifypayment);

router.get("/myorder/:id", orderControllers.getMyOrder);
router.get(
  "/myorders",
  orderControllers.getMyOrdersMW,
  orderControllers.getMyOrders
);
router.get("/:id", orderControllers.getAnOrder);
router.get("/", orderControllers.getAllOrders);
router.post("/checkout", orderControllers.checkoutCartItems);

module.exports = router;
