const router = require("express").Router();
const recipeControllers = require("../controllers/recipeControllers");
const authControllers = require("../controllers/authControllers");

router.get("/", recipeControllers.getRecipes);
router.get("/myrecipe",authControllers.protect, recipeControllers.getMyRecipes);
router.get("/:id", recipeControllers.getARecipe);
router.use(authControllers.protect);
router.post("/", recipeControllers.createRecipe);

router.delete("/:id", recipeControllers.deleteRecipe);
router.patch("/:id", recipeControllers.updateRecipe);

module.exports = router;
