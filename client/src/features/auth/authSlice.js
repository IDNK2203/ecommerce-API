import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerService, loginService } from "./authService";

const user = JSON.parse(localStorage.getItem("user"));
const initialState = {
  user: user,
  status: "idle",
  errorMsg: "",
};

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (user, thunkAPI) => {
    try {
      return await registerService(user);
    } catch (error) {
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
export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  try {
    return await loginService(user);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const logoutThunk = (dispatch, getState) => {
  localStorage.removeItem("user");
  dispatch(logout());
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.status = "idle";
      state.errorMsg = "";
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "pending";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload;
        state.errorMsg = "";
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.errorMsg = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.status = "pending";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload;
        state.errorMsg = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.errorMsg = action.payload;
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
