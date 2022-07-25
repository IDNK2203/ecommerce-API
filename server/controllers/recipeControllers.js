const Recipe = require("../models/recipe");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createRecipe = catchAsync(async (req, res, next) => {
  const payload = { ...req.body, chef: req.user._id };
  const recipe = await Recipe.create(payload);
  res.status(201).json({
    status: "success",
    recipe,
  });
});

exports.getRecipes = catchAsync(async (req, res, next) => {
  const recipes = await Recipe.find({}).populate("chef");
  res.status(200).json({
    status: "success",
    recipes,
  });
});

exports.getMyRecipes = catchAsync(async (req, res, next) => {
  const recipes = await Recipe.find({ chef: req.user._id }).populate("chef");
  res.status(200).json({
    status: "success",
    recipes,
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return next(new AppError("the recipe was not found", 404));
  if (recipe.chef._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError("you are not authorized to perform this operation", 403)
    );
  }
  await recipe.remove();
  res.status(204).json({
    status: "success",
  });
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
  const recipeCheck = await Recipe.findById(req.params.id);

  if (!recipeCheck) return next(new AppError("the recipe was not found", 404));

  if (recipeCheck.chef._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError("you are not authorized to perform this operation", 403)
    );
  }
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  console.log(recipe);
  res.status(201).json({
    status: "success",
    recipe,
  });
});

exports.getARecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id).populate("chef");
  res.status(200).json({
    status: "success",
    recipe,
  });
});
