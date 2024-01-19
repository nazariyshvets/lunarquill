import { useState, useEffect } from "react";
import { RtmClient, RtmChannel } from "agora-rtm-react";
import useRTMClient from "./useRTMClient";
import useRTMChannel from "./useRTMChannel";

interface UsersAttributes {
  [uid: string]: {
    username?: string;
    isCameraMuted?: boolean;
  };
}

const fetchUsersAttributes = async (
  RTMClient: RtmClient,
  RTMChannel: RtmChannel,
) => {
  try {
    const members = await RTMChannel.getMembers();
    const attributes = await Promise.all(
      members.map(async (uid) => {
        const { isCameraMuted, ...rest } =
          await RTMClient.getUserAttributes(uid);
        return [uid, { isCameraMuted: isCameraMuted === "true", ...rest }];
      }),
    );

    return Object.fromEntries(attributes);
  } catch (err) {
    console.log("Error fetching users attributes:", err);
    return {};
  }
};

const useUsersAttributes = () => {
  const [usersAttributes, setUsersAttributes] = useState<UsersAttributes>({});
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient);

  useEffect(() => {
    const fetchAttributes = async () => {
      const attributes = await fetchUsersAttributes(RTMClient, RTMChannel);
      setUsersAttributes(attributes);
    };

    fetchAttributes();
  }, [RTMClient, RTMChannel]);

  return usersAttributes;
};

export default useUsersAttributes;
