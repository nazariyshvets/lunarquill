import Validator from "validator";
import isEmpty from "is-empty";

interface LoginData {
  email: string;
  password: string;
}

const validateLoginInput = (data: LoginData) => {
  const errors: Record<string, string> = {};

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
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be from 6 to 30 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export default validateLoginInput;
