import Validator from "validator";
import isEmpty from "is-empty";

interface PasswordResetData {
  password: string;
  password2: string;
}

const validatePasswordResetInput = (data: PasswordResetData) => {
  let error = "";

  // Password checks
  if (isEmpty(data.password)) {
    error = "Password field is required";
  } else if (isEmpty(data.password2)) {
    error = "Confirm password field is required";
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    error = "Password must be from 6 to 30 characters";
  } else if (!Validator.equals(data.password, data.password2)) {
    error = "Passwords must match";
  }

  return {
    error,
    isValid: isEmpty(error),
  };
};

export default validatePasswordResetInput;
