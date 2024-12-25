import showToast from "./showToast";

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("success", `The ${type} is copied successfully`);
  } catch (err) {
    showToast("error", `Could not copy the ${type}. Please try again`);
    console.error(`Error copying the ${type}:`, err);
  }
};

export default copyToClipboard;
