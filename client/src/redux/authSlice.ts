import { createSlice } from "@reduxjs/toolkit";
import { registerUser, loginUser, loginUserWithGoogle } from "./authActions";
import type CustomError from "../types/CustomError";

export interface AuthState {
  loading: boolean;
  userToken: string | null;
  error: CustomError | null;
  success: boolean;
}

const initialState: AuthState = {
  loading: false,
  userToken: null,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userToken"); // deletes token from storage
      state.loading = false;
      state.userToken = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // register user
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.userToken = payload;
    });
    builder.addCase(registerUser.rejected, (state, { payload, error }) => {
      state.loading = false;

      if (payload) state.error = payload;
      else state.error = error.message;
    });

    // login user
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.userToken = payload;
    });
    builder.addCase(loginUser.rejected, (state, { payload, error }) => {
      state.loading = false;

      if (payload) state.error = payload;
      else state.error = error.message;
    });

    // login with google
    builder.addCase(loginUserWithGoogle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUserWithGoogle.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.userToken = payload;
    });
    builder.addCase(
      loginUserWithGoogle.rejected,
      (state, { payload, error }) => {
        state.loading = false;

        if (payload) state.error = payload;
        else state.error = error.message;
      },
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
