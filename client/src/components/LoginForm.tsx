import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa6";
import InputWithIcon from "./InputWithIcon";
import Button from "./Button";
import { loginUser } from "../redux/authActions";
import useAuth from "../hooks/useAuth";
import useError from "../hooks/useError";
import useAppDispatch from "../hooks/useAppDispatch";
import { EMAIL_PATTERN } from "../constants/constants";
import type LoginFormValues from "../types/LoginFormValues";

const LoginForm = () => {
  const { loading, error, success } = useAuth();
  const dispatch = useAppDispatch();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormValues>();
  const navigate = useNavigate();
  useError(error || null);

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    if (loading) return;

    // transform email string to lowercase to avoid case sensitivity issues in login
    data.email = data.email.toLowerCase();
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (success) navigate("/profile");
  }, [navigate, success]);

  return (
    <form
      method="POST"
      autoComplete="on"
      className="mt-10"
      onSubmit={handleSubmit(onSubmit)}
    >
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
        autoComplete="on"
        icon={<FaEnvelope />}
        containerClassName="mt-5"
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
        containerClassName="mt-5"
      />
      <Button type="submit" disabled={loading} className="mt-8">
        LOG IN
      </Button>
      <div className="mt-6 text-sm text-lightgrey sm:text-base">
        Not a member?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
