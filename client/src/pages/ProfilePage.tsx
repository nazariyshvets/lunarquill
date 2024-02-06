import { Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import useAppDispatch from "../hooks/useAppDispatch";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  useDocumentTitle("LunarQuill | Profile");

  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-center gap-4 bg-deep-black p-4 text-white">
      <Link to="/channel" className="border border-white px-8 py-2">
        Join Channel
      </Link>
      <button
        onClick={() => dispatch(logout())}
        className="border border-white px-8 py-2"
      >
        Log Out
      </button>
    </div>
  );
};

export default ProfilePage;
