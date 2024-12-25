import { useState, useEffect } from "react";

import ReactLoading from "react-loading";

import fetchFile from "../utils/fetchFile";
import showToast from "../utils/showToast";

interface TextFileViewerProps {
  url: string;
}

const TextFileViewer = ({ url }: TextFileViewerProps) => {
  const [textLines, setTextLines] = useState<string[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const file = await fetchFile(url, "txt", "");
        const text = await file.text();

        setTextLines(text.split("\n"));
      } catch (err) {
        showToast(
          "error",
          "An error occurred while fetching the text file. Please try again",
        );
        console.error("Error fetching the text file:", err);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div className="flex w-[9999px] max-w-full flex-col gap-1 rounded border border-white bg-black p-2 text-sm text-white sm:p-4 sm:text-base">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <ReactLoading type="spinningBubbles" />
        </div>
      ) : textLines && textLines.length > 0 ? (
        textLines.map((text, i) => (
          <span key={i} className="min-h-[0.875rem] break-all sm:min-h-[1rem]">
            {text}
          </span>
        ))
      ) : (
        <span className="text-danger">No data found</span>
      )}
    </div>
  );
};

export default TextFileViewer;
