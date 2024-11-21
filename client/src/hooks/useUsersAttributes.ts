import { useState, useEffect } from "react";

import { RtmClient, RtmChannel } from "agora-rtm-react";

interface UsersAttributes {
  [uid: string]: {
    username?: string;
    avatarId?: string;
    isCameraMuted?: boolean;
    isMicrophoneMuted?: boolean;
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
        const { isCameraMuted, isMicrophoneMuted, ...rest } =
          await RTMClient.getUserAttributes(uid);

        return [
          uid,
          {
            isCameraMuted: isCameraMuted === "true",
            isMicrophoneMuted: isMicrophoneMuted === "true",
            ...rest,
          },
        ];
      }),
    );

    return Object.fromEntries(attributes);
  } catch (err) {
    console.error("Error fetching users attributes:", err);
    return {};
  }
};

const useUsersAttributes = (RTMClient: RtmClient, RTMChannel: RtmChannel) => {
  const [usersAttributes, setUsersAttributes] = useState<UsersAttributes>({});

  useEffect(() => {
    (async () => {
      const attributes = await fetchUsersAttributes(RTMClient, RTMChannel);

      setUsersAttributes(attributes);
    })();
  }, [RTMClient, RTMChannel]);

  return usersAttributes;
};

export default useUsersAttributes;
