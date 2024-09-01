import { Link } from "react-router-dom";

interface WelcomePageActionButtonProps {
  isLogin: boolean;
}

const WelcomePageActionButton = ({ isLogin }: WelcomePageActionButtonProps) => (
  <Link
    to={`/${isLogin ? "login" : "signup"}`}
    className="w-1/2 animate-input truncate rounded border-2 px-4 py-2 text-center font-medium sm:text-lg xl:text-xl"
  >
    {isLogin ? "Log In" : "Sign Up"}
  </Link>
);

export default WelcomePageActionButton;
