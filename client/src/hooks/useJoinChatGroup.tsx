import { useState, useEffect } from "react";

import { AgoraChat } from "agora-chat";

import showToast from "../utils/showToast";
import { ChatType } from "../types/ChatType";

const useJoinChatGroup = (
  connection: AgoraChat.Connection,
  chatType: ChatType,
  targetId: string,
  isLocalUserChatMember: boolean,
) => {
  const [hasJoined, setHasJoined] = useState(false);

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
        showToast("error", "Could not connect to chat");
        console.error("Error joining chat group:", err);
      }
    })();
  }, [chatType, connection, targetId, isLocalUserChatMember]);

  return hasJoined;
};

export default useJoinChatGroup;
