import { Navigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface LoginSignupPageProps {
  isLogin: boolean;
}

const LoginSignupPage = ({ isLogin }: LoginSignupPageProps) => {
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
        </div>
      </div>
    </>
  );
};

export default LoginSignupPage;
