import { useEffect, useState } from "react";

import { useAlert } from "react-alert";

const useAlertMessage = (isSuccess: boolean, isError: boolean) => {
  const [message, setMessage] = useState<{ success: string; error: string }>();
  const alert = useAlert();

  useEffect(() => {
    isSuccess
      ? alert.success(message?.success)
      : isError && alert.error(message?.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError]);

  const setAlertMessage = (successMessage: string, errorMessage?: string) =>
    setMessage({
      success: successMessage,
      error: errorMessage ?? "Something went wrong",
    });

  return { setAlertMessage };
};

export default useAlertMessage;
