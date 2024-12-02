import { Outlet, Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useRTMClient from "../hooks/useRTMClient";
import useChatConnection from "../hooks/useChatConnection";
import useInitRTMClient from "../hooks/useInitRTMClient";
import useInitChat from "../hooks/useInitChat";
import useRTMTokenExpired from "../hooks/useRTMTokenExpired";
import useChatTokenWillExpire from "../hooks/useChatTokenWillExpire";
import usePeerMessageManager from "../hooks/usePeerMessageManager";
import useContactOnlineStatus from "../hooks/useContactOnlineStatus";

const ProtectedRoute = () => {
  const { userToken } = useAuth();
  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();

  useInitRTMClient(RTMClient);
  useInitChat(chatConnection);

  useRTMTokenExpired(RTMClient);
  useChatTokenWillExpire(chatConnection);

  usePeerMessageManager();
  useContactOnlineStatus();

  return userToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
