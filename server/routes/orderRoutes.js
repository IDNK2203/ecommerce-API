const router = require("express").Router();
const orderControllers = require("../controllers/orderControllers.js");
const authControllers = require("../controllers/authControllers");

router.use(authControllers.protect);
router.post("/checkout", orderControllers.checkoutCartItems);
router.get("/verify-callback", orderControllers.verifypayment);

module.exports = router;
