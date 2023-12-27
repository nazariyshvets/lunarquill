import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { FaEnvelope } from "react-icons/fa6";
import InputWithIcon from "../components/InputWithIcon";
import Button from "../components/Button";
import { useRequestPasswordResetMutation } from "../services/authService";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { EMAIL_PATTERN } from "../constants/constants";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";

interface FormValues {
  email: string;
}

const RequestPasswordResetPage = () => {
  const [countdown, setCountdown] = useState(0);
  const { userToken } = useAuth();
  const [requestResetPassword, { isLoading }] =
    useRequestPasswordResetMutation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();
  const alert = useAlert();
  useDocumentTitle("LunarQuill | Request password reset");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (countdown > 0 || isLoading) return;
    if (countdown === 0) setCountdown(60);

    try {
      data.email = data.email.toLowerCase();
      await requestResetPassword(data).unwrap();
      alert.success("Email with a reset password link is sent");
    } catch (err) {
      console.log(err);

      if (isFetchBaseQueryError(err)) {
        alert.error(err.data as string);
      } else if (isErrorWithMessage(err)) {
        alert.error(err.message);
      }

      setCountdown(0);
    }
  };

  useEffect(() => {
    // Update the countdown every second
    const intervalId = setInterval(() => {
      setCountdown(countdown > 0 ? countdown - 1 : 0);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  return (
    <>
      {userToken && <Navigate to="/profile" replace={true} />}

      <div className="flex h-[100dvh] items-center justify-center bg-deep-black text-center">
        <div className="relative h-auto w-72 rounded bg-black px-4 py-10 shadow-lg shadow-primary-600 sm:w-96 sm:p-10">
          <div className="text-3xl font-bold tracking-[2px] text-lightgrey">
            Request Password Reset
          </div>
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
              disabled={countdown > 0 || isLoading}
              required={true}
              minLength={3}
              maxLength={254}
              pattern={EMAIL_PATTERN}
              autoComplete="on"
              icon={<FaEnvelope />}
            />
            <Button
              type="submit"
              disabled={countdown > 0 || isLoading}
              className="mt-3"
            >
              {countdown > 0 ? `SEND (${countdown}s)` : "SEND"}
            </Button>
            <div className="text-sm text-lightgrey sm:text-base">
              Back to{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>{" "}
              page
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RequestPasswordResetPage;
