import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAlert } from "react-alert";

import GuestPage from "./GuestPage";
import { useVerifyAccountMutation } from "../services/authApi";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";

const AccountVerificationPage = () => {
  const [verifyAccount] = useVerifyAccountMutation();
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    (async () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const userId = urlSearchParams.get("id");
      const token = urlSearchParams.get("token");

      if (!userId || !token) {
        alert.error("User id or token was not present in the url");
        navigate("/login");
        return;
      }

      try {
        await verifyAccount({ userId, token }).unwrap();
        alert.success("Account is verified successfully");
      } catch (err) {
        console.error("Error verifying an account:", err);

        if (isFetchBaseQueryError(err)) {
          alert.error(err.data as string);
        } else if (isErrorWithMessage(err)) {
          alert.error(err.message);
        } else {
          alert.error("Could not verify an account");
        }
      } finally {
        navigate("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GuestPage title="account verification" />;
};

export default AccountVerificationPage;
