import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { initDB } from "react-indexed-db-hook";
import WelcomePage from "../pages/WelcomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import AccountVerificationPage from "../pages/AccountVerificationPage";
import RequestPasswordResetPage from "../pages/RequestPasswordResetPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../pages/ProfilePage";
import ChannelPage from "../pages/ChannelPage";
import useAuth from "../hooks/useAuth";
import RTCConfig from "../config/RTCConfig";
import RTMConfig from "../config/RTMConfig";
import DBConfig from "../config/DBConfig";
import DecodedUserToken from "../types/DecodedUserToken";

initDB(DBConfig);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/account-verification"
        element={<AccountVerificationPage />}
      />
      <Route
        path="/request-password-reset"
        element={<RequestPasswordResetPage />}
      />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/channel" element={<ChannelPage />} />
      </Route>
    </>,
  ),
);

const App = () => {
  const { userToken } = useAuth();

  if (userToken) {
    const decodedUserToken = jwtDecode<DecodedUserToken>(userToken);
    const userId = decodedUserToken.id;

    RTCConfig.uid = userId;
    RTMConfig.uid = userId;
    RTMConfig.username = decodedUserToken.username;
  }

  return <RouterProvider router={router} />;
};

export default App;
