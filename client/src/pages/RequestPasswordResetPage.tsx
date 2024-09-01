import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { FaEnvelope } from "react-icons/fa6";

import GuestPage from "./GuestPage";
import InputWithIcon from "../components/InputWithIcon";
import Button from "../components/Button";
import { useRequestPasswordResetMutation } from "../services/mainService";
import { EMAIL_PATTERN } from "../constants/constants";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";

interface FormValues {
  email: string;
}

const RequestPasswordResetPage = () => {
  const [countdown, setCountdown] = useState(0);
  const [requestResetPassword, { isLoading }] =
    useRequestPasswordResetMutation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();
  const alert = useAlert();

  const onSubmit: SubmitHandler<FormValues> = async ({ email }) => {
    if (countdown > 0 || isLoading) return;

    try {
      email = email.toLowerCase();
      await requestResetPassword({ email }).unwrap();
      alert.success("Email with a password reset link is sent");
      setCountdown(60);
    } catch (err) {
      console.error("Error requesting password reset link:", err);

      if (isFetchBaseQueryError(err)) {
        alert.error(err.data as string);
      } else if (isErrorWithMessage(err)) {
        alert.error(err.message);
      }
    }
  };

  useEffect(() => {
    if (countdown > 0)
      window.setTimeout(() => setCountdown(countdown - 1), 1000);
  }, [countdown]);

  const isInputDisabled = countdown > 0 || isLoading;

  return (
    <GuestPage title="request password reset">
      <form
        method="POST"
        autoComplete="on"
        className="mt-10 flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <InputWithIcon
          name="email"
          register={register}
          type="text"
          errors={errors["email"]}
          placeholder="Email"
          disabled={isInputDisabled}
          required={true}
          minLength={3}
          maxLength={254}
          pattern={EMAIL_PATTERN}
          autoComplete="on"
          icon={<FaEnvelope />}
        />
        <Button type="submit" disabled={isInputDisabled} className="mt-3">
          SEND {countdown > 0 && `(${countdown}s)`}
        </Button>
        <div className="text-sm text-lightgrey sm:text-base">
          Back to{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>{" "}
          page
        </div>
      </form>
    </GuestPage>
  );
};

export default RequestPasswordResetPage;
