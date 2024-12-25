import showToast from "./showToast";
import getErrorMessage from "./getErrorMessage";

const handleError = (
  error: unknown,
  defaultAlertMessage: string,
  consoleMessage: string,
) => {
  showToast(
    "error",
    getErrorMessage({
      error,
      defaultErrorMessage: defaultAlertMessage,
    }),
  );
  console.error(consoleMessage, error);
};

export default handleError;
