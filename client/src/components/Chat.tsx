import React, { useState, useRef, useCallback, useEffect } from "react";

import AC, { AgoraChat } from "agora-chat";
import _ from "lodash";
import { useAlert } from "react-alert";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { BiMicrophone, BiPaperclip, BiSmile } from "react-icons/bi";

import MessageGroup from "./MessageGroup";
import ChatForm from "./CharForm";
import SimpleButton from "./SimpleButton";
import AudioRecorder from "./AudioRecorder";
import useChatConnection from "../hooks/useChatConnection";
import groupMessages from "../utils/groupMessages";
import parseMessage from "../utils/parseMessage";
import { ERROR_CODES } from "../constants/constants";
import ChatConfig from "../config/ChatConfig";
import type Message from "../types/Message";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [emojiPickerState, setEmojiPickerState] = useState<{
    isOpened: boolean;
    messageId?: string;
  }>();
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const areMessagesFetchingRef = useRef(false);
  const messagesCursorRef = useRef<string>();
  const connection = useChatConnection();
  const alert = useAlert();

  // ===== FUNCTIONS =====

  const getMessages = useCallback(async () => {
    areMessagesFetchingRef.current = true;

    try {
      const res = await connection.getHistoryMessages({
        targetId: ChatConfig.chatId,
        chatType: "groupChat",
        pageSize: 20,
        searchDirection: "up",
        cursor: messagesCursorRef.current,
      });

      messagesCursorRef.current = res.cursor;
      setMessages((prevState) => [
        ...(
          res.messages
            .map((message) => parseMessage(message))
            .filter(Boolean) as Message[]
        ).reverse(),
        ...prevState,
      ]);
    } catch (err) {
      alert.error("Could not retrieve history messages");
      console.log(err);
    } finally {
      areMessagesFetchingRef.current = false;
    }
  }, [connection, alert]);

  const adjustMessageInputHeight = () => {
    const messageInput = messageInputRef.current;

    if (messageInput) {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight + 2}px`;
    }
  };

  const getLocalUserReactions = (messageId: string) => {
    const reactionMessage = messages.find(
      (message) => message.id === messageId,
    );

    return reactionMessage?.reactions?.filter((reaction) =>
      reaction.userList.find((userId) => userId === ChatConfig.uid),
    );
  };

  // ===== HANDLERS =====

  const handleTextMessageInput = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setMessage(event.target.value);
    adjustMessageInputHeight();
  };

  const handleTextMessageSend = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const options: AgoraChat.CreateMsgType = {
      type: "txt",
      msg: message,
      to: ChatConfig.chatId,
      chatType: "groupChat",
      ext: {
        senderUsername: ChatConfig.username,
      },
    };

    try {
      const msg = AC.message.create(options);
      const { serverMsgId } = await connection.send(msg);

      const newMessage: Message = {
        id: serverMsgId,
        type: "txt",
        msg: message,
        senderId: ChatConfig.uid,
        senderUsername: ChatConfig.username,
        recipientId: msg.to,
        time: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      adjustMessageInputHeight();
    } catch (err) {
      alert.error(
        "An error occurred while sending text message. Please try again",
      );
      console.log(err);
    }
  };

  const handleAudioMessageSend = (blob: Blob) => {
    const filename = "audio.mp3";
    const filetype = "audio/mp3";
    const file: AgoraChat.FileObj = {
      data: new File([blob], filename, { type: filetype }),
      filename,
      filetype,
      url: "",
    };

    handleFileMessageSend("audio", file);
  };

  const handleFileMessageSend = async (
    type: "img" | "audio" | "video" | "file",
    file: AgoraChat.FileObj,
  ) => {
    const options: AgoraChat.CreateMsgType = {
      type,
      file,
      filename: file.filename,
      to: ChatConfig.chatId,
      chatType: "groupChat",
      ext: {
        senderUsername: ChatConfig.username,
        fileType: file.filetype,
        fileName: file.filename,
        fileSize: file.data.size,
      },
      onFileUploadComplete: (event: AgoraChat.UploadFileResult) => {
        file.url = event.url;
      },
    };

    try {
      const msg = AC.message.create(options);
      const { serverMsgId } = await connection.send(msg);

      setMessages((prev) => [
        ...prev,
        {
          id: serverMsgId,
          type,
          file,
          fileType: file.filetype,
          fileName: file.filename,
          fileSize: file.data.size,
          url: file.url,
          senderId: ChatConfig.uid,
          senderUsername: ChatConfig.username,
          recipientId: msg.to,
          time: Date.now(),
        },
      ]);
    } catch (err) {
      alert.error(
        `An error occurred while sending ${type} message. Please try again`,
      );
      console.log(err);
    }
  };

  const handleEmojiAdd = async (emojiUnified: string) => {
    const messageInput = messageInputRef.current;

    if (messageInput) {
      setMessage(
        (prevState) =>
          prevState.slice(0, messageInput.selectionStart) +
          String.fromCodePoint(parseInt(emojiUnified, 16)) +
          prevState.slice(messageInput.selectionEnd),
      );
      messageInput.focus();
      adjustMessageInputHeight();
    }
  };

  const handleEmojiClick = async (data: EmojiClickData) => {
    const messageId = emojiPickerState?.messageId;

    if (messageId) {
      await handleReactionClick(messageId, data.unified);
      setEmojiPickerState((prevState) => ({
        ...prevState,
        isOpened: false,
        messageId: "",
      }));
    } else {
      await handleEmojiAdd(data.unified);
    }
  };

  const handleReactionAdd = async (messageId: string, emojiUnified: string) => {
    try {
      await connection.addReaction({
        messageId: messageId,
        reaction: emojiUnified,
      });
    } catch (err) {
      const reactionErr = err as { type: number; message: string };

      if (reactionErr?.type === ERROR_CODES.REACTION_ALREADY_ADDED) {
        alert.info("Reaction is already added");
      } else {
        alert.info("Something went wrong");
      }

      console.log("Error adding reaction:", reactionErr);
    }
  };

  const handleReactionRemove = async (messageId: string) => {
    const localUserReactions = getLocalUserReactions(messageId);
    const removeReactionPromises = localUserReactions?.map((prevReaction) =>
      connection.deleteReaction({
        messageId: messageId,
        reaction: prevReaction.reaction,
      }),
    );

    if (removeReactionPromises?.length) {
      try {
        await Promise.all(removeReactionPromises);
      } catch (err) {
        alert.error("Could not remove reaction. Please try again");
        console.log("Error removing reaction:", err);
      }
    }
  };

  const handleReactionClick = async (
    messageId: string,
    emojiUnified?: string,
  ) => {
    if (emojiUnified) {
      const localUserReactions = getLocalUserReactions(messageId);
      const isReactionSelected = localUserReactions?.find(
        (reaction) => reaction.reaction === emojiUnified,
      );

      await handleReactionRemove(messageId);

      if (!isReactionSelected) await handleReactionAdd(messageId, emojiUnified);
    } else
      setEmojiPickerState((prevState) => ({
        ...prevState,
        isOpened: true,
        messageId,
      }));
  };

  const handleRecordedAudioSubmit = (blob: Blob) => {
    handleAudioMessageSend(blob);
    setIsRecordingAudio(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && fileInputRef.current) {
      const filetype = selectedFile.type;
      const file = AC.utils.getFileUrl(fileInputRef.current);

      if (filetype.startsWith("image/")) {
        handleFileMessageSend("img", file);
      } else if (filetype.startsWith("audio/")) {
        handleFileMessageSend("audio", file);
      } else if (filetype.startsWith("video/")) {
        handleFileMessageSend("video", file);
      } else {
        handleFileMessageSend("file", file);
      }
    }
  };

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    const handleMessagesContainerScroll = _.debounce(() => {
      if (
        !areMessagesFetchingRef.current &&
        messagesCursorRef.current !== "undefined" &&
        messagesContainer &&
        messagesContainer.scrollTop <= 100
      ) {
        getMessages();
      }
    }, 200);

    messagesContainer?.addEventListener(
      "scroll",
      handleMessagesContainerScroll,
    );

    return () => {
      messagesContainer?.removeEventListener(
        "scroll",
        handleMessagesContainerScroll,
      );
    };
  }, [getMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleMessage = async (
      message:
        | AgoraChat.TextMsgBody
        | AgoraChat.ImgMsgBody
        | AgoraChat.AudioMsgBody
        | AgoraChat.VideoMsgBody
        | AgoraChat.FileMsgBody,
    ) => {
      const parsedMessage = parseMessage(message);

      if (parsedMessage) {
        setMessages((prev) => [...prev, parsedMessage]);
      }
    };

    connection.addEventHandler("message", {
      onTextMessage: handleMessage,
      onImageMessage: handleMessage,
      onAudioMessage: handleMessage,
      onVideoMessage: handleMessage,
      onFileMessage: handleMessage,
      onReactionChange: (reactionMsg) => {
        setMessages((prevState) =>
          prevState.map((message) =>
            message.id === reactionMsg.messageId
              ? { ...message, reactions: reactionMsg.reactions }
              : message,
          ),
        );
      },
    });

    return () => {
      connection.removeEventHandler("message");
    };
  }, [connection]);

  const messageGroups = groupMessages(messages);

  return (
    <div className="flex h-full flex-col bg-deep-black">
      <div
        ref={messagesContainerRef}
        className="flex h-full flex-col gap-4 overflow-auto px-1 py-2 sm:px-2 sm:py-3"
      >
        {messageGroups.map((group) => (
          <MessageGroup
            key={group.id}
            {...group}
            isLocalUser={group.messages.at(0)?.senderId === ChatConfig.uid}
            onReactionClick={handleReactionClick}
          />
        ))}
      </div>

      <div className="relative flex flex-col gap-2 border-t border-lightgrey p-2">
        <ChatForm
          ref={messageInputRef}
          message={message}
          onMessageInput={handleTextMessageInput}
          onSubmit={handleTextMessageSend}
        />

        <div className="flex items-center">
          <SimpleButton
            isActive={emojiPickerState?.isOpened}
            onClick={() =>
              setEmojiPickerState((prevState) => ({
                ...prevState,
                isOpened: !prevState?.isOpened,
                messageId: "",
              }))
            }
          >
            <BiSmile className="text-lg sm:text-xl" />
          </SimpleButton>
          <SimpleButton onClick={() => setIsRecordingAudio(true)}>
            <BiMicrophone className="text-lg sm:text-xl" />
          </SimpleButton>
          <SimpleButton onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            <BiPaperclip className="-rotate-45 text-lg sm:text-xl" />
          </SimpleButton>
        </div>

        {emojiPickerState?.isOpened && (
          <div className="absolute bottom-full left-0 z-20">
            <EmojiPicker
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              skinTonesDisabled
              height={300}
              searchDisabled
              previewConfig={{ showPreview: false }}
              onEmojiClick={handleEmojiClick}
            />
          </div>
        )}

        {isRecordingAudio && (
          <AudioRecorder
            onSubmit={handleRecordedAudioSubmit}
            onCancel={() => setIsRecordingAudio(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
