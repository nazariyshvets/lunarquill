import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_SERVER_URL } from "../constants/constants";
import type LoginFormValues from "../types/LoginFormValues";
import type SignupFormValues from "../types/SignupFormValues";
import type CustomError from "../types/CustomError";

export const registerUser = createAsyncThunk<
  string,
  SignupFormValues,
  { rejectValue: CustomError }
>(
  "auth/register",
  async ({ username, email, password, password2 }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${BASE_SERVER_URL}/api/auth/register`,
        { username, email, password, password2 },
        config,
      );

      return data;
    } catch (err) {
      const error = err as AxiosError<CustomError>;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const loginUser = createAsyncThunk<
  string,
  LoginFormValues,
  { rejectValue: CustomError }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      `${BASE_SERVER_URL}/api/auth/login`,
      { email, password },
      config,
    );

    return data;
  } catch (err) {
    const error = err as AxiosError<CustomError>;
    if (!error.response) {
      throw err;
    }
    return rejectWithValue(error.response.data);
  }
});

export const loginUserWithGoogle = createAsyncThunk<
  string,
  string,
  { rejectValue: CustomError }
>("auth/login-with-google", async (code, { rejectWithValue }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      `${BASE_SERVER_URL}/api/auth/login-with-google`,
      { code },
      config,
    );

    return data;
  } catch (err) {
    const error = err as AxiosError<CustomError>;
    if (!error.response) {
      throw err;
    }
    return rejectWithValue(error.response.data);
  }
});
