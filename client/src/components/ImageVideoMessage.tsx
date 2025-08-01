import { useState, useMemo } from "react";

import { BiPlay } from "react-icons/bi";

import MediaModal from "./MediaModal";

interface ImageVideoMessageProps {
  type: "img" | "video";
  url: string;
}

const ImageVideoMessage = ({ type, url }: ImageVideoMessageProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const messageWidgetAttrs = useMemo(
    () => ({
      src: url,
      className:
        "max-h-[128px] max-w-[128px] cursor-pointer rounded object-cover xl:max-h-[240px] xl:max-w-[240px]",
      draggable: false,
      onClick: () => setIsOpened(true),
    }),
    [url],
  );

  return (
    <>
      {type === "img" ? (
        <img alt={url} {...messageWidgetAttrs} />
      ) : (
        <div className="flex items-center justify-center">
          <video {...messageWidgetAttrs} />
          <BiPlay className="pointer-events-none absolute text-3xl text-white xl:text-5xl" />
        </div>
      )}
      {isOpened && (
        <MediaModal type={type} url={url} onClose={() => setIsOpened(false)} />
      )}
    </>
  );
};

export default ImageVideoMessage;
