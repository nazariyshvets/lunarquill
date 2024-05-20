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
import SidebarLayout from "./SidebarLayout";
import ProfilePage from "../pages/ProfilePage";
import ContactAdditionPage from "../pages/ContactAdditionPage";
import ChannelAdditionPage from "../pages/ChannelAdditionPage";
import RequestsPage from "../pages/RequestsPage";
import ChannelPage from "../pages/ChannelPage";
import useAuth from "../hooks/useAuth";
import RTCConfig from "../config/RTCConfig";
import RTMConfig from "../config/RTMConfig";
import ChatConfig from "../config/ChatConfig";
import DBConfig from "../config/DBConfig";
import type DecodedUserToken from "../types/DecodedUserToken";

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
        <Route element={<SidebarLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/add-contact" element={<ContactAdditionPage />} />
          <Route path="/add-channel" element={<ChannelAdditionPage />} />
          <Route path="/requests" element={<RequestsPage />} />
        </Route>
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
    const username = decodedUserToken.username;

    RTCConfig.uid = userId;
    RTMConfig.uid = userId;
    RTMConfig.username = username;
    ChatConfig.uid = userId;
    ChatConfig.username = username;
  }

  return <RouterProvider router={router} />;
};

export default App;
