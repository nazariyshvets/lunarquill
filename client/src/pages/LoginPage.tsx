import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa6";

import GuestPage from "./GuestPage";
import LoginForm from "../components/LoginForm";
import Button from "../components/Button";
import { loginUserWithGoogle } from "../redux/authActions";
import useAppDispatch from "../hooks/useAppDispatch";

const LoginPage = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: "http://localhost:3000/login",
  });

  useEffect(() => {
    // Extract the authorization code from the URL query parameters
    const urlParams = new URLSearchParams(location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
      dispatch(loginUserWithGoogle(authCode));
    }
  }, [dispatch, location.search]);

  return (
    <GuestPage title="login">
      <LoginForm />

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="w-full border border-grey"></span>
          <span className="text-lightgrey">or</span>
          <span className="w-full border border-grey"></span>
        </div>
        <Button
          className="flex items-center justify-center gap-4"
          onClick={googleLogin}
        >
          <FaGoogle /> Log in with Google
        </Button>
      </div>
    </GuestPage>
  );
};

export default LoginPage;
