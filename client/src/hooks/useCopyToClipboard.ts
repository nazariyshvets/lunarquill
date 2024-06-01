import { useAlert } from "react-alert";

const useCopyToClipboard = () => {
  const alert = useAlert();

  return async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert.success(`The ${type} is copied successfully`);
    } catch (err) {
      alert.error(`Could not copy the ${type}. Please try again`);
      console.log(err);
    }
  };
};

export default useCopyToClipboard;
