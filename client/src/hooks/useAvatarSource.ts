import { useState, useEffect } from "react";

import { skipToken } from "@reduxjs/toolkit/query";

import { useDownloadFileQuery } from "../services/mainService";

const useAvatarSource = (avatarId: string | undefined) => {
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

  return avatarSrc;
};

export default useAvatarSource;
