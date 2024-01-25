import { Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
// import { useGetUserDetailsQuery } from "../services/mainService";
import RTCControlPanel from "../components/RTCControlPanel";
import useAppDispatch from "../hooks/useAppDispatch";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ProfilePage = () => {
  // const { data } = useGetUserDetailsQuery({});
  const dispatch = useAppDispatch();
  useDocumentTitle("LunarQuill | Profile");

  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-end gap-4 bg-deep-black p-4 text-white">
      <h1>You are logged in</h1>
      <Link to="/channel" className="border border-white px-8 py-2">
        Join Channel
      </Link>
      <button
        onClick={() => dispatch(logout())}
        className="border border-white px-8 py-2"
      >
        Log Out
      </button>
      <RTCControlPanel
        isCameraMuted
        isMicrophoneMuted
        isLocalScreenShared={false}
        onToggleCamera={() => {}}
        onToggleMicrophone={() => {}}
        onToggleScreen={() => {}}
      />
    </div>
  );
};

export default ProfilePage;
