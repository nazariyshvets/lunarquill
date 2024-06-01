import { useParams, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import ChatLayout from "../components/ChatLayout";
import { useGetChannelByIdQuery } from "../services/mainService";
import { ChatTypeEnum } from "../types/ChatType";

const ChannelChatPage = () => {
  const { id } = useParams();
  const { data: channel } = useGetChannelByIdQuery(id ?? skipToken);
  const navigate = useNavigate();

  return (
    <ChatLayout
      contactName={channel?.name ?? "Unknown channel"}
      isContactOnline={false}
      chatType={ChatTypeEnum.GroupChat}
      chatTargetId={channel?.chatTargetId ?? null}
      channelId={id}
      onCallBtnClick={() => navigate(`/channels/${id}/call`)}
    />
  );
};

export default ChannelChatPage;
