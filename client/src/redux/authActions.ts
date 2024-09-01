import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { BASE_SERVER_URL } from "../constants/constants";
import type { LoginFormValues, SignupFormValues } from "../types/Auth";
import type CustomError from "../types/CustomError";

const apiRequest = async <T>(
  endpoint: string,
  body: T,
  rejectWithValue: (data: CustomError) => unknown,
) => {
  try {
    const { data } = await axios.post(`${BASE_SERVER_URL}${endpoint}`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (err) {
    const error = err as AxiosError<CustomError>;

    if (!error.response) {
      throw err;
    }

    return rejectWithValue(error.response.data);
  }
};

export const registerUser = createAsyncThunk<
  string,
  SignupFormValues,
  { rejectValue: CustomError }
>("auth/register", async (formData, { rejectWithValue }) =>
  apiRequest("/api/auth/register", formData, rejectWithValue),
);

export const loginUser = createAsyncThunk<
  string,
  LoginFormValues,
  { rejectValue: CustomError }
>("auth/login", async (formData, { rejectWithValue }) =>
  apiRequest("/api/auth/login", formData, rejectWithValue),
);

export const loginUserWithGoogle = createAsyncThunk<
  string,
  string,
  { rejectValue: CustomError }
>("auth/login-with-google", async (code, { rejectWithValue }) =>
  apiRequest("/api/auth/login-with-google", { code }, rejectWithValue),
);
