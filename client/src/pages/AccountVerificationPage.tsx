import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import GuestPage from "./GuestPage";
import { useVerifyAccountMutation } from "../services/mainService";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";

const AccountVerificationPage = () => {
  const [verifyAccount] = useVerifyAccountMutation();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const userId = urlSearchParams.get("id");
  const token = urlSearchParams.get("token");
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyAccount({ userId, token }).unwrap();
        alert.success("Account is verified successfully");
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

    verify();
  }, [alert, navigate, token, userId, verifyAccount]);

  return <GuestPage title="account verification" />;
};

export default AccountVerificationPage;
