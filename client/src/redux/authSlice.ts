import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { registerUser, loginUser, loginUserWithGoogle } from "./authActions";
import decodeUserToken from "../utils/decodeUserToken";
import type CustomError from "../types/CustomError";

export interface AuthState {
  loading: boolean;
  userToken: string | null;
  error: CustomError | null;
  success: boolean;
  userId: string | null;
  username: string | null;
}

const initialState: AuthState = {
  loading: false,
  userToken: null,
  error: null,
  success: false,
  userId: null,
  username: null,
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
      state.userId = null;
      state.username = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUserId: (state, { payload }: PayloadAction<string | null>) => {
      state.userId = payload;
    },
    setUsername: (state, { payload }: PayloadAction<string | null>) => {
      state.username = payload;
    },
  },
  extraReducers: (builder) => {
    // register user
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
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
      const { userId, username } = decodeUserToken(payload);

      state.loading = false;
      state.success = true;
      state.userToken = payload;
      state.userId = userId;
      state.username = username ?? null;
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
      const { userId, username } = decodeUserToken(payload);

      state.loading = false;
      state.success = true;
      state.userToken = payload;
      state.userId = userId;
      state.username = username ?? null;
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

export const { logout, clearError, setUserId, setUsername } = authSlice.actions;
export default authSlice.reducer;
