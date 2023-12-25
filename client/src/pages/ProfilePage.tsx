import { logout } from "../redux/authSlice";
import useAppDispatch from "../hooks/useAppDispatch";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  useDocumentTitle("LunarQuill | Profile");

  return (
    <>
      <h1>You are logged in</h1>
      <button onClick={() => dispatch(logout())}>Log Out</button>
    </>
  );
};

export default ProfilePage;
