const router = require("express").Router();
const authControllers = require("../controllers/authControllers");

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.post("/logout", authControllers.logout);
router.post("/forgotpassword", authControllers.forgotPassword);
router.patch("/resetpassword/:token", authControllers.resetPassword);

router.use(authControllers.protect);
// regular user routes
router.patch("/updatepassword", authControllers.updatePassword);

module.exports = router;
