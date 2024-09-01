import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

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
import ContactChatPage from "../pages/ContactChatPage";
import ChannelChatPage from "../pages/ChannelChatPage";
import ChannelPage from "../pages/ChannelPage";
import CallManager from "./CallManager";
import DBConfig from "../config/DBConfig";

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
        <Route element={<CallManager />}>
          <Route element={<SidebarLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-contact" element={<ContactAdditionPage />} />
            <Route path="/add-channel" element={<ChannelAdditionPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/contacts/:id/chat" element={<ContactChatPage />} />
            <Route path="/channels/:id/chat" element={<ChannelChatPage />} />
          </Route>
          <Route path="/contacts/:id/call" element={<ChannelPage />} />
          <Route path="/channels/:id/call" element={<ChannelPage />} />
        </Route>
      </Route>
    </>,
  ),
);

const App = () => <RouterProvider router={router} />;

export default App;
