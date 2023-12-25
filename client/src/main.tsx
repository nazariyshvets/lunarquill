import "./index.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "./components/AlertTemplate";
import App from "./components/App";
import store, { persistor } from "./redux/store";
import { ALERT_OPTIONS } from "./constants/constants";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider template={AlertTemplate} {...ALERT_OPTIONS}>
          <App />
        </AlertProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
