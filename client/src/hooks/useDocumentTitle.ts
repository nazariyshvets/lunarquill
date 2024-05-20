import { useEffect } from "react";

const useDocumentTitle = (title: string, withPrefix = true) => {
  useEffect(() => {
    document.title = `${withPrefix ? "LunarQuill | " : ""}${title}`;
  }, [title, withPrefix]);
};

export default useDocumentTitle;
