import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { FaLock } from "react-icons/fa6";
import GuestPage from "./GuestPage";
import InputWithIcon from "../components/InputWithIcon";
import Button from "../components/Button";
import { useResetPasswordMutation } from "../services/authService";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";

interface FormValues {
  password: string;
  password2: string;
}

const PasswordResetPage = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const userId = urlSearchParams.get("id");
  const token = urlSearchParams.get("token");
  const navigate = useNavigate();
  const alert = useAlert();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isLoading) return;

    // Passwords must match
    if (data.password !== data.password2) {
      alert.error("Passwords must match");
      return;
    }

    try {
      await resetPassword({ userId, token, ...data }).unwrap();
      alert.success("Password is changed successfully");
      navigate("/login");
    } catch (err) {
      console.log(err);

      if (isFetchBaseQueryError(err)) {
        alert.error(err.data as string);
      } else if (isErrorWithMessage(err)) {
        alert.error(err.message);
      }
    }
  };

  return (
    <GuestPage title="password reset">
      <form
        method="POST"
        autoComplete="on"
        className="mt-10 flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <InputWithIcon
          name="password"
          register={register}
          type="password"
          errors={errors["password"]}
          placeholder="Password"
          disabled={isLoading}
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
          disabled={isLoading}
          required={true}
          minLength={6}
          maxLength={30}
          icon={<FaLock />}
        />
        <Button type="submit" disabled={isLoading} className="mt-3">
          CONFIRM
        </Button>
      </form>
    </GuestPage>
  );
};

export default PasswordResetPage;
