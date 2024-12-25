import { toast } from "react-toastify";

type ToastType = "info" | "success" | "warning" | "error";

const showToast = (type: ToastType, message: string) => {
  switch (type) {
    case "info":
    case "warning":
    case "success":
      toast[type](message);
      break;
    default:
      toast(message);
  }
};

export default showToast;
