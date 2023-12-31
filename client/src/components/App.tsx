import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import RequestPasswordResetPage from "../pages/RequestPasswordResetPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/request-password-reset"
        element={<RequestPasswordResetPage />}
      />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </>,
  ),
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
