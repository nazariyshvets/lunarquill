import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import GuestPage from "./GuestPage";
import { useVerifyAccountMutation } from "../services/authApi";
import isFetchBaseQueryError from "../utils/isFetchBaseQueryError";
import isErrorWithMessage from "../utils/isErrorWithMessage";
import showToast from "../utils/showToast";

const AccountVerificationPage = () => {
  const [verifyAccount] = useVerifyAccountMutation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const userId = urlSearchParams.get("id");
      const token = urlSearchParams.get("token");

      if (!userId || !token) {
        showToast("error", "User id or token was not present in the url");
        navigate("/login");
        return;
      }

      try {
        await verifyAccount({ userId, token }).unwrap();
        showToast("success", "Account is verified successfully");
      } catch (err) {
        console.error("Error verifying an account:", err);

        if (isFetchBaseQueryError(err)) {
          showToast("error", err.data as string);
        } else if (isErrorWithMessage(err)) {
          showToast("error", err.message);
        } else {
          showToast("error", "Could not verify an account");
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
