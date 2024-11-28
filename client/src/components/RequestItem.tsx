import { BiXCircle, BiCheckCircle } from "react-icons/bi";

import Contact from "./Contact";
import RequestItemActionButton from "./RequestItemActionButton";
import { RequestType } from "../types/Request";

interface RequestItemProps {
  type: RequestType;
  context: "inbox" | "outbox";
  username: string;
  userAvatarId?: string;
  channelName?: string;
  channelAvatarId?: string;
  onDecline?: () => void;
  onAccept?: () => void;
  onRecall?: () => void;
}

const RequestItem = ({
  type,
  context,
  username,
  userAvatarId,
  channelName = "unknown",
  channelAvatarId,
  onDecline,
  onAccept,
  onRecall,
}: RequestItemProps) => {
  const renderMessage = () => {
    switch (type) {
      case RequestType.Contact:
        return context === "inbox"
          ? "sends you a contact request"
          : "received your contact request";
      case RequestType.Invite:
        return context === "inbox"
          ? "invites you to join"
          : "received your invite to join";
      case RequestType.Join:
        return context === "inbox"
          ? "wants to join"
          : "channel received your joining request";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded bg-black p-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex items-center gap-1">
          <Contact name={username} isOnline={false} avatarId={userAvatarId} />
          <span className="text-sm text-lightgrey">{renderMessage()}</span>
        </div>

        {(type === RequestType.Invite ||
          (type === RequestType.Join && context === "inbox")) &&
          channelName && (
            <div className="flex items-center gap-1">
              <Contact
                name={channelName}
                isOnline={false}
                avatarId={channelAvatarId}
              />
              <span className="text-sm text-lightgrey">channel</span>
            </div>
          )}
      </div>

      <div className="flex items-center gap-2 self-end">
        {context === "outbox" ? (
          <RequestItemActionButton
            label="Recall"
            icon={BiXCircle}
            isPositiveAction={false}
            onClick={onRecall}
          />
        ) : (
          <>
            <RequestItemActionButton
              label="Decline"
              icon={BiXCircle}
              isPositiveAction={false}
              onClick={onDecline}
            />
            <RequestItemActionButton
              label="Accept"
              icon={BiCheckCircle}
              onClick={onAccept}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RequestItem;
