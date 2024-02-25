import { useState } from "react";
import MediaModal from "./MediaModal";

interface ImageMessageProps {
  url: string;
}

const ImageMessage = ({ url }: ImageMessageProps) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <img
        src={url}
        alt={url}
        className="max-h-[128px] max-w-[128px] cursor-pointer rounded object-cover xl:max-h-[256px] xl:max-w-[256px]"
        draggable={false}
        onClick={() => setIsOpened(true)}
      />
      {isOpened && (
        <MediaModal type="img" url={url} onClose={() => setIsOpened(false)} />
      )}
    </>
  );
};

export default ImageMessage;
