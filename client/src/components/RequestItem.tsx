import { BiXCircle, BiCheckCircle } from "react-icons/bi";

import Contact from "./Contact";
import RequestItemActionButton from "./RequestItemActionButton";

interface RequestItemProps {
  type: "contactship" | "invite" | "join";
  context: "inbox" | "outbox";
  username: string;
  channelName?: string;
}

const RequestItem = ({
  type,
  context,
  username,
  channelName,
}: RequestItemProps) => {
  const renderMessage = () => {
    switch (type) {
      case "contactship":
        return context === "inbox"
          ? "sends you a contactship request"
          : "received your contactship request";
      case "invite":
        return context === "inbox"
          ? "invites you to join"
          : "received your invite to join";
      case "join":
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
          <Contact name={username} isOnline={false} />
          <span className="text-sm text-lightgrey">{renderMessage()}</span>
        </div>

        {type !== "contactship" && channelName && (
          <div className="flex items-center gap-1">
            <Contact name={channelName} isOnline={false} />
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
          />
        ) : (
          <>
            <RequestItemActionButton
              label="Decline"
              icon={BiXCircle}
              isPositiveAction={false}
            />
            <RequestItemActionButton label="Accept" icon={BiCheckCircle} />
          </>
        )}
      </div>
    </div>
  );
};

export default RequestItem;
