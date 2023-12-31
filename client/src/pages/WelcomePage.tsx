import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import StarryBackground from "../components/StarryBackground";
import useDocumentTitle from "../hooks/useDocumentTitle";

const WelcomePage = () => {
  useDocumentTitle("LunarQuill | Welcome");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep-black py-2 text-white">
      <StarryBackground />

      <img
        src="/logo_512.png"
        alt="logo"
        draggable="false"
        className="absolute opacity-50"
      />

      <div className="relative flex w-5/6 flex-col items-center justify-center gap-4 sm:w-1/2 xl:w-1/3">
        <h1 className="animate-stripe break-all bg-stripe bg-clip-text text-center text-6xl font-black text-transparent sm:text-7xl xl:text-8xl">
          Welcome
        </h1>
        <TypeAnimation
          sequence={[
            "LunarQuill is the app where you can elevate your conversations with seamless 1-to-1 and room-based text, audio, and video chat",
            1000,
            "Enjoy rich media sharing, screen sharing, and personalized avatars",
            1000,
            "Engage in voice-changing calls, schedule virtual events, and collaborate on a persistent drawing board",
            1000,
            "Set your custom status and presence for a personalized touch",
            1000,
          ]}
          wrapper="p"
          speed={50}
          repeat={Infinity}
          className="text-shadow text-center sm:text-lg xl:text-xl"
        />
        <div className="mt-4 flex w-full gap-4">
          <Link
            to="/login"
            className="w-1/2 animate-input truncate rounded border-2 px-4 py-2 text-center font-medium sm:text-lg xl:text-xl"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="w-1/2 animate-input truncate rounded border-2 px-4 py-2 text-center font-medium sm:text-lg xl:text-xl"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
