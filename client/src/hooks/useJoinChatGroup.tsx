import { useState, useEffect } from "react";

import { useAlert } from "react-alert";
import { AgoraChat } from "agora-chat";

import { ChatType } from "../types/ChatType";

const useJoinChatGroup = (
  connection: AgoraChat.Connection,
  chatType: ChatType,
  targetId: string,
  isLocalUserChatMember: boolean,
) => {
  const [hasJoined, setHasJoined] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    (async () => {
      try {
        if (chatType === ChatType.GroupChat && isLocalUserChatMember) {
          const { data: joinedGroups } = await connection.getJoinedGroups({
            pageNum: 1,
            pageSize: 500,
          });
          const isUserInGroup = joinedGroups?.some((group) =>
            "groupid" in group
              ? group.groupid === targetId
              : "groupId" in group
                ? group.groupId === targetId
                : false,
          );

          if (!isUserInGroup) {
            await connection.joinGroup({ groupId: targetId, message: "" });
          }
        }

        setHasJoined(true);
      } catch (err) {
        setHasJoined(false);
        alert.error("Could not connect to chat");
        console.error("Error joining chat group:", err);
      }
    })();
  }, [chatType, connection, targetId, isLocalUserChatMember, alert]);

  return hasJoined;
};

export default useJoinChatGroup;
