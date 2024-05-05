import { useFastboard, Fastboard } from "@netless/fastboard-react";

import type WhiteboardRoomCredentials from "../types/WhiteboardRoomCredentials";

interface WhiteboardProps {
  roomCredentials: WhiteboardRoomCredentials;
}

const Whiteboard = ({ roomCredentials }: WhiteboardProps) => {
  const fastboard = useFastboard(() => ({
    sdkConfig: {
      appIdentifier: import.meta.env.VITE_AGORA_WHITEBOARD_APP_ID,
      region: "eu",
    },
    joinRoom: roomCredentials,
  }));

  return (
    <Fastboard
      app={fastboard}
      config={{
        toolbar: {
          items: [
            "clicker",
            "selector",
            "pencil",
            "text",
            "shapes",
            "eraser",
            "clear",
            "hand",
          ],
          apps: { enable: false },
        },
      }}
    />
  );
};

export default Whiteboard;
