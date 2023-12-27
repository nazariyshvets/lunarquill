import Validator from "validator";
import isEmpty from "is-empty";

interface RequestPasswordResetData {
  email: string;
}

const validateRequestPasswordResetInput = (data: RequestPasswordResetData) => {
  let error = "";

  // Email checks
  if (isEmpty(data.email)) {
    error = "Email field is required";
  } else if (!Validator.isLength(data.email, { min: 3, max: 254 })) {
    error = "Email must be from 3 to 254 characters";
  } else if (!Validator.isEmail(data.email)) {
    error = "Email is invalid";
  }

  return {
    error,
    isValid: isEmpty(error),
  };
};

export default validateRequestPasswordResetInput;
