import { useEffect } from "react";

import { AgoraChat } from "agora-chat";

import useAuth from "./useAuth";
import useAppDispatch from "./useAppDispatch";
import { useFetchChatTokenMutation } from "../services/tokenApi";
import { setIsChatInitialized } from "../redux/chatSlice";
import showToast from "../utils/showToast";

const useInitChat = (connection: AgoraChat.Connection) => {
  const { userId } = useAuth();
  const [fetchChatToken] = useFetchChatTokenMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) {
      return;
    }

    (async () => {
      try {
        const token = await fetchChatToken(userId).unwrap();

        await connection.open({
          user: userId,
          agoraToken: token,
        });
        dispatch(setIsChatInitialized(true));
      } catch (err) {
        dispatch(setIsChatInitialized(false));
        showToast("error", "Could not establish chat connection");
        console.error("Chat initialization failed:", err);
      }
    })();

    return () => {
      connection.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};

export default useInitChat;
