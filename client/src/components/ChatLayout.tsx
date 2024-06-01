import { useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { BiPhone, BiUserPlus, BiUserX, BiLogOut, BiCopy } from "react-icons/bi";

import Chat from "../components/Chat";
import Contact from "../components/Contact";
import SimpleButton from "../components/SimpleButton";
import Loading from "../components/Loading";
import Modal from "./Modal";
import Input from "./Input";
import useAppSelector from "../hooks/useAppSelector";
import useRTMClient from "../hooks/useRTMClient";
import useAuth from "../hooks/useAuth";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
import useChatConnection from "../hooks/useChatConnection";
import {
  useCreateRequestMutation,
  useLeaveChannelMutation,
  useDisableWhiteboardRoomMutation,
  useFetchContactRelationMutation,
  useRemoveContactMutation,
} from "../services/mainService";
import getErrorMessage from "../utils/getErrorMessage";
import fetchWhiteboardSdkToken from "../utils/fetchWhiteboardSdkToken";
import { ChatTypeEnum } from "../types/ChatType";
import { RequestTypeEnum } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

interface ChatLayoutProps {
  contactName: string;
  isContactOnline: boolean;
  chatType: ChatTypeEnum;
  chatTargetId: string | null;
  channelId?: string;
  onCallBtnClick: () => void;
}

type ModalAction = "inviteUser" | "leaveChannel" | "removeContact";

const ChatLayout = ({
  contactName,
  isContactOnline,
  chatType,
  chatTargetId,
  channelId,
  onCallBtnClick,
}: ChatLayoutProps) => {
  const { userId } = useAuth();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ModalAction;
  }>();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ contactId: string }>();
  const inviteFormRef = useRef<HTMLFormElement>(null);
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();
  const authRequestConfig = useAuthRequestConfig();
  const [disableWhiteboardRoom] = useDisableWhiteboardRoomMutation();
  const [fetchContactRelation] = useFetchContactRelationMutation();
  const [createRequest] = useCreateRequestMutation();
  const [leaveChannel] = useLeaveChannelMutation();
  const [removeContact] = useRemoveContactMutation();
  const copyToClipboard = useCopyToClipboard();
  const alert = useAlert();
  const navigate = useNavigate();

  const handleModalCancel = () => setModalState(undefined);

  const handleModalSave = async (action: ModalAction) => {
    switch (action) {
      case "inviteUser":
        inviteFormRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
        break;
      case "leaveChannel":
        try {
          await Promise.all([
            chatConnection.leaveGroup({
              groupId: chatTargetId ?? "",
            }),
            leaveChannel({
              userId: userId ?? "",
              channelId: channelId ?? "",
            }),
          ]);
          navigate("/profile");
          alert.success("You left the channel successfully");
        } catch (err) {
          alert.error(
            getErrorMessage({
              error: err,
              defaultErrorMessage:
                "Could not leave the channel. Please try again",
            }),
          );
          console.log(err);
        }
        break;
      case "removeContact":
        try {
          const contactRelation = await fetchContactRelation({
            userId1: userId ?? "",
            userId2: chatTargetId ?? "",
          }).unwrap();
          const whiteboardSdkToken =
            await fetchWhiteboardSdkToken(authRequestConfig);

          await Promise.all([
            disableWhiteboardRoom({
              roomUuid: contactRelation.whiteboardRoomId,
              sdkToken: whiteboardSdkToken,
            }).unwrap(),
            removeContact({
              user1Id: userId ?? "",
              user2Id: chatTargetId ?? "",
            }).unwrap(),
          ]);
          await RTMClient.sendMessageToPeer(
            { text: PeerMessage.ContactRemoved },
            chatTargetId ?? "",
          );
          navigate("/profile");
          alert.success("The contact was deleted successfully");
        } catch (err) {
          alert.error(
            getErrorMessage({
              error: err,
              defaultErrorMessage:
                "Could not delete the contact. Please try again",
            }),
          );
          console.log(err);
        }
    }
  };

  const handleFormSubmit: SubmitHandler<{ contactId: string }> = async (
    data,
  ) => {
    try {
      await Promise.all([
        createRequest({
          from: userId ?? "",
          to: data.contactId,
          type: RequestTypeEnum.Invite,
          channel: channelId ?? "",
        }).unwrap(),
        chatConnection.inviteUsersToGroup({
          groupId: chatTargetId ?? "",
          users: [data.contactId],
        }),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestCreated },
        data.contactId,
      );
      alert.success("Request created successfully!");
      setModalState(undefined);
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage:
            "Could not send an invite request. Please try again",
        }),
      );
      console.log(err);
    }
  };

  if (!isChatInitialized) return <Loading />;

  const isModalOpen = modalState?.isOpen;
  const modalAction = modalState?.action;

  return (
    chatTargetId && (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-white p-2">
          <Contact name={contactName} isOnline={isContactOnline} size="sm" />

          <div className="flex items-center gap-4 text-xl">
            <SimpleButton onClick={onCallBtnClick}>
              <BiPhone />
            </SimpleButton>

            {chatType === ChatTypeEnum.SingleChat ? (
              <SimpleButton
                isDanger
                onClick={() =>
                  setModalState({ isOpen: true, action: "removeContact" })
                }
              >
                <BiUserX />
              </SimpleButton>
            ) : (
              <>
                <SimpleButton
                  onClick={() => copyToClipboard(channelId ?? "", "channel id")}
                >
                  <BiCopy />
                </SimpleButton>
                <SimpleButton
                  onClick={() =>
                    setModalState({ isOpen: true, action: "inviteUser" })
                  }
                >
                  <BiUserPlus />
                </SimpleButton>
                <SimpleButton
                  isDanger
                  onClick={() =>
                    setModalState({ isOpen: true, action: "leaveChannel" })
                  }
                >
                  <BiLogOut />
                </SimpleButton>
              </>
            )}
          </div>
        </div>

        <Chat chatType={chatType} targetId={chatTargetId} />

        {isModalOpen && modalAction && (
          <Modal
            title={
              modalAction === "inviteUser"
                ? "Enter user's id"
                : modalAction === "leaveChannel"
                  ? "Are you sure you want to leave this channel"
                  : "Are you sure you want to delete this contact"
            }
            onCancel={handleModalCancel}
            onSave={() => handleModalSave(modalAction)}
          >
            {modalAction === "inviteUser" && (
              <form
                ref={inviteFormRef}
                method="POST"
                autoComplete="off"
                onSubmit={handleSubmit(handleFormSubmit)}
              >
                <Input
                  name="contactId"
                  register={register}
                  errors={errors["contactId"]}
                  required
                />
              </form>
            )}
          </Modal>
        )}
      </div>
    )
  );
};

export default ChatLayout;
