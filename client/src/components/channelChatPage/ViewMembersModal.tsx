import { useState } from "react";

import { Tooltip } from "react-tooltip";
import { useAlert } from "react-alert";
import { BiUserPlus, BiUserX } from "react-icons/bi";

import Contact from "../Contact";
import SimpleButton from "../SimpleButton";
import Modal from "../Modal";
import { useKickUserOutOfChannelMutation } from "../../services/channelApi";
import useChatConnection from "../../hooks/useChatConnection";
import useIsUserOnline from "../../hooks/useIsUserOnline";
import useAddContact from "../../hooks/useAddContact";
import useSendMessageToPeer from "../../hooks/useSendMessageToPeer";
import type { UserWithoutPassword } from "../../types/User";
import type { Channel } from "../../types/Channel";
import PeerMessage from "../../types/PeerMessage";

interface ViewMembersModalProps {
  localUserId: string | null | undefined;
  contacts: UserWithoutPassword[];
  channel: Channel | undefined;
  channelMembers: UserWithoutPassword[];
  onClose: () => void;
}

interface KickUserModalState {
  isOpen: boolean;
  userId?: string;
}

const initialKickUserModalState: KickUserModalState = {
  isOpen: false,
};

const ViewMembersModal = ({
  localUserId,
  contacts,
  channel,
  channelMembers,
  onClose,
}: ViewMembersModalProps) => {
  const [kickUserModalState, setKickUserModalState] = useState(
    initialKickUserModalState,
  );
  const chatConnection = useChatConnection();
  const [kickUserOutOfChannel] = useKickUserOutOfChannelMutation();
  const addContact = useAddContact();
  const isUserOnline = useIsUserOnline();
  const alert = useAlert();
  const sendMessageToPeer = useSendMessageToPeer();
  const isLocalUserAdmin =
    !!localUserId && !!channel?.admin && localUserId === channel?.admin;

  const handleKickUserModalOpen = (userId: string) =>
    setKickUserModalState({ isOpen: true, userId });

  const handleKickUserModalClose = () =>
    setKickUserModalState(initialKickUserModalState);

  const handleUserKick = async () => {
    const channelId = channel?._id;
    const channelChatTargetId = channel?.chatTargetId;
    const targetUserId = kickUserModalState.userId;

    if (isLocalUserAdmin && targetUserId && channelId && channelChatTargetId) {
      try {
        await Promise.all([
          kickUserOutOfChannel({
            adminId: localUserId,
            targetUserId,
            channelId,
          }).unwrap(),
          chatConnection.removeGroupMember({
            groupId: channelChatTargetId,
            username: targetUserId,
          }),
        ]);
        handleKickUserModalClose();
        alert.success("User was kicked out of the channel successfully");

        await Promise.all([
          sendMessageToPeer(
            targetUserId,
            `${PeerMessage.ChannelKicked}__${channelId}`,
          ),
          channelMembers
            .filter((member) => member._id !== localUserId)
            .map((member) =>
              sendMessageToPeer(
                member._id,
                `${PeerMessage.ChannelMemberKicked}__${channelId}`,
              ),
            ),
        ]);
      } catch (err) {
        alert.error("Could not kick the user out of the channel");
        console.error("Error kicking the user out of the channel:", err);
      }
    }
  };

  const isLocalUser = (id: string) => id === localUserId;

  const handleContactAdd = async (contactId: string) => {
    try {
      await addContact(contactId);
    } catch (error) {
      error instanceof Error
        ? alert.error(error.message)
        : typeof error === "string" && alert.error(error);
      console.error("Error sending a contact request:", error);
    }
  };

  const channelMembersSorter = (
    a: UserWithoutPassword,
    b: UserWithoutPassword,
  ) =>
    isLocalUser(a._id)
      ? -1
      : isLocalUser(b._id)
        ? 1
        : isUserOnline(a._id) && !isUserOnline(b._id)
          ? -1
          : !isUserOnline(a._id) && isUserOnline(b._id)
            ? 1
            : 0;

  return (
    <>
      <Modal
        title="Members list"
        displayButtons={false}
        ignoreClickOutside={kickUserModalState.isOpen}
        onCancel={onClose}
        onSave={onClose}
      >
        <div className="flex flex-col gap-2">
          {[...channelMembers].sort(channelMembersSorter).map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between gap-2"
            >
              <Contact
                name={isLocalUser(member._id) ? "You" : member.username}
                isOnline={
                  isLocalUser(member._id) ? true : isUserOnline(member._id)
                }
                avatarId={member.selectedAvatar}
              />

              {!isLocalUser(member._id) && (
                <div className="flex items-center gap-2">
                  {!contacts.some((contact) => contact._id === member._id) && (
                    <SimpleButton
                      data-tooltip-id="addUserToContacts"
                      data-tooltip-content="Add to contacts"
                      className="text-xl"
                      onClick={() => handleContactAdd(member._id)}
                    >
                      <BiUserPlus />
                    </SimpleButton>
                  )}

                  {isLocalUserAdmin && (
                    <SimpleButton
                      isDanger
                      data-tooltip-id="kickUserOutOfChannel"
                      data-tooltip-content="Kick out of the channel"
                      className="text-xl"
                      onClick={() => handleKickUserModalOpen(member._id)}
                    >
                      <BiUserX />
                    </SimpleButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {kickUserModalState.isOpen && (
        <Modal
          title="Are you sure you want to kick the user out of this channel?"
          onCancel={handleKickUserModalClose}
          onSave={handleUserKick}
        />
      )}

      <Tooltip id="addUserToContacts" />
      <Tooltip id="kickUserOutOfChannel" />
    </>
  );
};

export default ViewMembersModal;
