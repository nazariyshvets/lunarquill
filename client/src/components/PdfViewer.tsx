import { useState, KeyboardEvent } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useWindowWidth } from "@react-hook/window-size";
import { BiChevronLeftCircle, BiChevronRightCircle } from "react-icons/bi";
import SimpleButton from "./SimpleButton";
import {
  MOBILE_SCREEN_THRESHOLD,
  LAPTOP_SCREEN_THRESHOLD,
} from "../constants/constants";

import "react-pdf/dist/Page/AnnotationLayer.css";

interface PdfViewerProps {
  url: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const PdfViewer = ({ url }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputValue, setPageInputValue] = useState("1");
  const windowWidth = useWindowWidth();

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const decreasePage = () => {
    const prevPage = Math.max(pageNumber - 1, 1);

    setPageNumber(prevPage);
    setPageInputValue(prevPage.toString());
  };

  const increasePage = () => {
    if (numPages) {
      const nextPage = Math.min(pageNumber + 1, numPages);

      setPageNumber(nextPage);
      setPageInputValue(nextPage.toString());
    }
  };

  const setPage = () => {
    const value = Number(pageInputValue);

    if (numPages) {
      if (value < 1 || value > numPages) {
        setPageNumber(1);
        setPageInputValue("1");
      } else {
        setPageNumber(value);
        setPageInputValue(value.toString());
      }
    }
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setPage();
    }
  };

  const pageWidth =
    windowWidth < MOBILE_SCREEN_THRESHOLD
      ? 256
      : windowWidth < LAPTOP_SCREEN_THRESHOLD
        ? 512
        : 1024;

  return (
    <div className="relative max-h-full overflow-hidden">
      <Document
        file={url}
        options={options}
        externalLinkTarget="_blank"
        onLoadSuccess={handleDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} width={pageWidth} />
      </Document>

      {numPages && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded bg-black text-white sm:gap-1">
          <SimpleButton onClick={decreasePage}>
            <BiChevronLeftCircle className="text-sm sm:text-base" />
          </SimpleButton>
          <span className="flex-shrink-0 text-xs sm:text-sm">
            <input
              type="number"
              value={pageInputValue}
              min={1}
              max={numPages}
              className="rounded bg-grey text-center outline-0"
              onChange={(event) => setPageInputValue(event.target.value)}
              onBlur={setPage}
              onKeyDown={handleInputKeyPress}
            />
            /{numPages}
          </span>
          <SimpleButton onClick={increasePage}>
            <BiChevronRightCircle className="text-sm sm:text-base" />
          </SimpleButton>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
