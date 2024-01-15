import { Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useGetUserDetailsQuery } from "../services/mainService";
import useAppDispatch from "../hooks/useAppDispatch";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ProfilePage = () => {
  const { data } = useGetUserDetailsQuery({});
  const dispatch = useAppDispatch();
  useDocumentTitle("LunarQuill | Profile");

  console.log(data);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1>You are logged in</h1>
      <Link to="/channel" className="border border-deep-black px-8 py-2">
        Join Channel
      </Link>
      <button
        onClick={() => dispatch(logout())}
        className="border border-deep-black px-8 py-2"
      >
        Log Out
      </button>
    </div>
  );
};

export default ProfilePage;
