import { useState, useEffect } from "react";

import { skipToken } from "@reduxjs/toolkit/query";
import { BiEdit } from "react-icons/bi";

import SimpleButton from "./SimpleButton";
import { useDownloadFileQuery } from "../services/mainService";
import type Size from "../types/Size";

interface ContactProps {
  name: string;
  isOnline: boolean;
  avatarId?: string;
  size?: Size;
  layout?: "horizontal" | "vertical";
  withOverlay?: boolean;
  onClick?: () => void;
  onEditAvatarBtnClick?: () => void;
}

const SIZE_STYLES_MAP: Record<Size, string> = {
  sm: "h-8 w-8 text-sm sm:h-9 sm:w-9 xl:h-10 xl:w-10",
  md: "h-10 w-10 text-base sm:h-11 sm:w-11 xl:h-12 xl:w-12",
  lg: "h-12 w-12 text-lg sm:h-[52px] sm:w-[52px] xl:h-14 xl:w-14",
  xl: "h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl xl:h-32 xl:w-32 xl:text-5xl",
};

const Contact = ({
  name,
  isOnline,
  avatarId,
  size = "md",
  layout = "horizontal",
  withOverlay = false,
  onClick,
  onEditAvatarBtnClick,
}: ContactProps) => {
  const [avatarSrc, setAvatarSrc] = useState<string>();

  const { data: avatarBlob } = useDownloadFileQuery(avatarId ?? skipToken);

  useEffect(() => {
    if (avatarBlob) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const mimeType =
          base64Data.match(/^data:(.*?);base64/)?.[1] || "image/jpeg";

        setAvatarSrc(`data:${mimeType};base64,${base64Data.split(",")[1]}`);
      };
      reader.readAsDataURL(avatarBlob);
    }
  }, [avatarBlob]);

  useEffect(() => {
    if (!avatarId) {
      setAvatarSrc(undefined);
    }
  }, [avatarId]);

  return (
    <div
      className={`flex max-w-full items-center gap-1 overflow-hidden ${
        layout === "vertical" ? "flex-col" : ""
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div
        className={`relative flex flex-shrink-0 items-center justify-center rounded-full bg-charcoal text-white ${SIZE_STYLES_MAP[size]}`}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            className="h-full w-full rounded-full object-cover"
            draggable={false}
          />
        ) : (
          name.slice(0, 2).toUpperCase()
        )}
        {withOverlay && (
          <div className="absolute flex h-full w-full items-center justify-center rounded-full bg-deep-black bg-opacity-70 opacity-0 hover:opacity-100">
            <SimpleButton onClick={onEditAvatarBtnClick}>
              <BiEdit className="text-[0.8em]" />
            </SimpleButton>
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-1/4 w-1/4 rounded-full bg-primary" />
        )}
      </div>
      <span className="max-w-full truncate text-sm font-medium text-white">
        {name}
      </span>
    </div>
  );
};

export default Contact;
