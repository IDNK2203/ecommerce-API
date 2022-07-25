import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMyRecipes, reset } from "../features/recipe/recipeSlice";

function useFetchMyRecipe() {
  const dispatch = useDispatch();
  const { status, recipes, errorMsg } = useSelector((state) => state.recipes);

  useEffect(() => {
    dispatch(fetchMyRecipes());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  return { status, recipes, errorMsg };
}

export default useFetchMyRecipe;
