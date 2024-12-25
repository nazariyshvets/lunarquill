import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";

import App from "./components/App";
import store, { persistor } from "./redux/store";
import { TOAST_OPTIONS } from "./constants/constants";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
        <ToastContainer {...TOAST_OPTIONS} />
      </GoogleOAuthProvider>
    </PersistGate>
  </Provider>,
);
