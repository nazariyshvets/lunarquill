import { logout } from "../redux/authSlice";
import { useGetUserDetailsQuery } from "../services/authService";
import useAppDispatch from "../hooks/useAppDispatch";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ProfilePage = () => {
  const { data } = useGetUserDetailsQuery({});
  const dispatch = useAppDispatch();
  useDocumentTitle("LunarQuill | Profile");

  console.log(data);

  return (
    <>
      <h1>You are logged in</h1>
      <button onClick={() => dispatch(logout())}>Log Out</button>
    </>
  );
};

export default ProfilePage;
