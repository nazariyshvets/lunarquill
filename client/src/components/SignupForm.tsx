import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa6";

import InputWithIcon from "./InputWithIcon";
import Button from "./Button";
import { registerUser } from "../redux/authActions";
import useAuth from "../hooks/useAuth";
import useAuthError from "../hooks/useAuthError";
import useAppDispatch from "../hooks/useAppDispatch";
import {
  USERNAME_PATTERN,
  ALPHANUMERIC_START_END_PATTERN,
  NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN,
  EMAIL_PATTERN,
} from "../constants/constants";
import type { SignupFormValues } from "../types/Auth";

const SignupForm = () => {
  const { loading, success } = useAuth();
  const dispatch = useAppDispatch();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignupFormValues>();
  const alert = useAlert();
  useAuthError();

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    if (loading) return;

    // check if passwords match
    if (data.password !== data.password2) {
      alert.error("Passwords must match");
    } else {
      // transform email string to lowercase to avoid case sensitivity issues in login
      data.email = data.email.toLowerCase();
      dispatch(registerUser(data));
    }
  };

  useEffect(() => {
    if (success) alert.info("Verification email is sent");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const usernameValidation = {
    username: (value: string) =>
      USERNAME_PATTERN.test(value) ||
      "Username must only contain alphanumeric characters, underscores and hyphens",
    alphanumericStartEnd: (value: string) =>
      ALPHANUMERIC_START_END_PATTERN.test(value) ||
      "Username must start/end with alphanumeric characters",
    noConsecutiveHyphenUnderscore: (value: string) =>
      NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN.test(value) ||
      "There cannot be consecutive underscores or hyphens within the username",
  };

  return (
    <form
      method="POST"
      autoComplete="off"
      className="mt-10 flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <InputWithIcon
        name="username"
        register={register}
        type="text"
        errors={errors["username"]}
        placeholder="Username"
        disabled={loading}
        required={true}
        minLength={1}
        maxLength={30}
        validate={usernameValidation}
        autoComplete="off"
        icon={<FaUser />}
      />
      <InputWithIcon
        name="email"
        register={register}
        type="text"
        errors={errors["email"]}
        placeholder="Email"
        disabled={loading}
        required={true}
        minLength={3}
        maxLength={254}
        pattern={EMAIL_PATTERN}
        autoComplete="off"
        icon={<FaEnvelope />}
      />
      <InputWithIcon
        name="password"
        register={register}
        type="password"
        errors={errors["password"]}
        placeholder="Password"
        disabled={loading}
        required={true}
        minLength={6}
        maxLength={30}
        icon={<FaLock />}
      />
      <InputWithIcon
        name="password2"
        register={register}
        type="password"
        errors={errors["password2"]}
        placeholder="Confirm password"
        disabled={loading}
        required={true}
        minLength={6}
        maxLength={30}
        icon={<FaLock />}
      />
      <Button type="submit" disabled={loading} className="mt-3">
        SIGN UP
      </Button>
      <div className="text-sm text-lightgrey sm:text-base">
        Is a member?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
