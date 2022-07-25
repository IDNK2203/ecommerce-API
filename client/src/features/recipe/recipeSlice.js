import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createRecipeService,
  myRecipesService,
  deleteRecipeService,
  updateRecipeService,
} from "./recipeService";

const initialState = {
  recipes: [],
  status: "idle",
  errorMsg: "",
};

// Register user
export const fetchMyRecipes = createAsyncThunk(
  "recipes/myRecipes",
  async (user, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user
        ? thunkAPI.getState().auth.user.token
        : "";
      return await myRecipesService(token);
    } catch (error) {
      console.error(error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// Register user
export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user
        ? thunkAPI.getState().auth.user.token
        : "";
      return await createRecipeService(token, formData);
    } catch (error) {
      console.error(error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register user
export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user
        ? thunkAPI.getState().auth.user.token
        : "";

      return await updateRecipeService(token, data);
    } catch (error) {
      console.error(error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user
        ? thunkAPI.getState().auth.user.token
        : "";
      await deleteRecipeService(token, id);
      return thunkAPI.fulfillWithValue(id);
    } catch (error) {
      console.error(error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    reset: (state) => {
      state.status = "idle";
      state.errorMsg = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRecipes.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchMyRecipes.fulfilled, (state, action) => {
        state.status = "success";
        state.recipes = action.payload;
        state.errorMsg = "";
      })
      .addCase(fetchMyRecipes.rejected, (state, action) => {
        state.status = "error";
        state.errorMsg = action.payload;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.recipes.push(action.payload.recipe);
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const nonupdated = state.recipes.find(
          (el) => el._id !== action.payload.recipe._id
        );
        nonupdated.dishName = action.payload.recipe.dishName;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter((el) => el._id !== action.payload);
      });
  },
});

export const { reset } = recipeSlice.actions;
export default recipeSlice.reducer;
