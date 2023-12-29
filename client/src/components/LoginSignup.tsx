import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface LoginSignupProps {
  isLogin: boolean;
}

const LoginSignup = ({
  isLogin,
  children,
}: PropsWithChildren<LoginSignupProps>) => {
  const { userToken } = useAuth();
  useDocumentTitle(`LunarQuill | ${isLogin ? "Login" : "Signup"}`);

  return (
    <>
      {userToken && <Navigate to="/profile" replace={true} />}

      <div className="flex h-[100dvh] items-center justify-center bg-deep-black text-center">
        <div className="relative h-auto w-72 rounded bg-black px-4 py-10 shadow-lg shadow-primary-600 sm:w-96 sm:p-10">
          <div className="text-3xl font-bold tracking-[2px] text-lightgrey">
            {isLogin ? "LOGIN" : "SIGNUP"}
          </div>
          {isLogin ? <LoginForm /> : <SignupForm />}

          {children}
        </div>
      </div>
    </>
  );
};

export default LoginSignup;
