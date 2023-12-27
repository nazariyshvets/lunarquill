import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginSignupPage from "../pages/LoginSignupPage";
import RequestPasswordResetPage from "../pages/RequestPasswordResetPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<div>App</div>} />
      <Route path="/login" element={<LoginSignupPage isLogin={true} />} />
      <Route path="/signup" element={<LoginSignupPage isLogin={false} />} />
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
