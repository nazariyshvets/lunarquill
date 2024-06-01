import { useEffect, useRef } from "react";

import { AgoraChat } from "agora-chat";

import useAuth from "./useAuth";
import useAuthRequestConfig from "./useAuthRequestConfig";
import useAppSelector from "./useAppSelector";
import useAppDispatch from "./useAppDispatch";
import fetchChatToken from "../utils/fetchChatToken";
import { setIsChatInitialized } from "../redux/chatSlice";
import ChatConfig from "../config/ChatConfig";

const useInitChat = (connection: AgoraChat.Connection) => {
  const isInitialized = useAppSelector((state) => state.chat.isChatInitialized);
  // Whether the process of initialization is happening
  const isLoadingRef = useRef(false);
  const { userId } = useAuth();
  const requestConfig = useAuthRequestConfig();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!ChatConfig.serverUrl || !userId) {
      console.warn("ChatConfig.serverUrl or userId is empty");
      return;
    }

    if (!isInitialized && !isLoadingRef.current)
      (async () => {
        isLoadingRef.current = true;

        try {
          const token = await fetchChatToken(userId, requestConfig);

          ChatConfig.token = token;
          await connection.open({
            user: userId,
            agoraToken: token,
          });
          dispatch(setIsChatInitialized(true));
        } catch (err) {
          dispatch(setIsChatInitialized(false));
          console.log(err);
        } finally {
          isLoadingRef.current = false;
        }
      })();

    return () => {
      if (isInitialized) connection.close();
    };
  }, [connection, dispatch, isInitialized, requestConfig, userId]);
};

export default useInitChat;
