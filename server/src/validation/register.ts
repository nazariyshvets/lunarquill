import Validator from "validator";
import isEmpty from "is-empty";

interface RegistrationData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

function validateRegisterInput(data: RegistrationData) {
  const errors: Record<string, string> = {};

  // Username checks
  if (isEmpty(data.username)) {
    errors.username = "Username field is required";
  } else if (!Validator.isLength(data.username, { min: 1, max: 30 })) {
    errors.username = "Username must be from 1 to 30 characters";
  } else if (!/^[\w-]+$/.test(data.username)) {
    errors.username =
      "Username must only contain alphanumeric characters, underscores and hyphens";
  } else if (!/^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/.test(data.username)) {
    errors.username = "Username must start/end with alphanumeric characters";
  } else if (!/^(?!.*[-_]{2})[a-zA-Z0-9_-]+$/.test(data.username)) {
    errors.username =
      "There cannot be consecutive underscores or hyphens within the username";
  }

  // Email checks
  if (isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isLength(data.email, { min: 3, max: 254 })) {
    errors.email = "Email must be from 3 to 254 characters";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // Password checks
  if (isEmpty(data.password)) {
    errors.password = "Password field is required";
  } else if (isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be from 6 to 30 characters";
  } else if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

export default validateRegisterInput;
