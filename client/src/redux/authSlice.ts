import { createSlice, SerializedError } from "@reduxjs/toolkit";

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

// Utility functions for updating state
const setPending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
};

const setFulfilled = (state: AuthState, payload: string) => {
  const { userId, username } = decodeUserToken(payload);

  state.loading = false;
  state.success = true;
  state.userToken = payload;
  state.userId = userId;
  state.username = username ?? null;
};

const setRejected = (
  state: AuthState,
  { payload, error }: { payload?: CustomError; error: SerializedError },
) => {
  state.loading = false;
  state.error = payload ?? error.message;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userToken"); // deletes token from storage
      Object.assign(state, initialState); // resets state to initial values
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // register user
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerUser.rejected, setRejected)
      // login user
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        setFulfilled(state, payload);
      })
      .addCase(loginUser.rejected, setRejected)
      // login with google
      .addCase(loginUserWithGoogle.pending, setPending)
      .addCase(loginUserWithGoogle.fulfilled, (state, { payload }) => {
        setFulfilled(state, payload);
      })
      .addCase(loginUserWithGoogle.rejected, setRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
