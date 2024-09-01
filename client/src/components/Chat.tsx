import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from "react";

import AC, { AgoraChat } from "agora-chat";
import { useAlert } from "react-alert";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";

import ChatMessagesView from "./ChatMessagesView";
import ChatForm from "./ChatForm";
import ChatToolbar from "./ChatToolbar";
import AudioRecorder from "./AudioRecorder";
import useChatConnection from "../hooks/useChatConnection";
import useAuth from "../hooks/useAuth";
import groupMessages from "../utils/groupMessages";
import parseMessage from "../utils/parseMessage";
import { ERROR_CODES } from "../constants/constants";
import type { ChatType } from "../types/ChatType";
import type Message from "../types/Message";

interface ChatProps {
  chatType: ChatType;
  targetId: string;
}

const Chat = ({ chatType, targetId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [emojiPickerState, setEmojiPickerState] = useState<{
    isOpened: boolean;
    messageId?: string;
  }>({ isOpened: false });
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const areMessagesFetchingRef = useRef(false);
  const messagesCursorRef = useRef<string>();
  const connection = useChatConnection();
  const { userId, username } = useAuth();
  const alert = useAlert();

  // ===== FUNCTIONS =====

  const getMessages = useCallback(async () => {
    areMessagesFetchingRef.current = true;

    try {
      const res = await connection.getHistoryMessages({
        targetId,
        chatType,
        pageSize: 20,
        searchDirection: "up",
        cursor: messagesCursorRef.current,
      });

      messagesCursorRef.current = res.cursor;
      setMessages((prevState) => [
        ...(
          res.messages.map(parseMessage).filter(Boolean) as Message[]
        ).reverse(),
        ...prevState,
      ]);
    } catch (err) {
      alert.error("Could not retrieve history messages");
      console.error("Error retrieving history messages:", err);
    } finally {
      areMessagesFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, chatType]);

  const adjustMessageInputHeight = useCallback(() => {
    const messageInput = messageInputRef.current;

    if (messageInput) {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight + 2}px`;
    }
  }, []);

  const getLocalUserReactions = useCallback(
    (messageId: string) => {
      const reactionMessage = messages.find(
        (message) => message.id === messageId,
      );

      return reactionMessage?.reactions?.filter((reaction) =>
        reaction.userList.find((uid) => uid === userId),
      );
    },
    [messages, userId],
  );

  // ===== HANDLERS =====

  const handleTextMessageInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
      adjustMessageInputHeight();
    },
    [adjustMessageInputHeight],
  );

  const handleTextMessageSend = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const options: AgoraChat.CreateMsgType = {
        type: "txt",
        msg: message,
        to: targetId,
        chatType,
        ext: {
          senderUsername: username,
        },
      };

      try {
        const msg = AC.message.create(options);
        const { serverMsgId } = await connection.send(msg);

        const newMessage: Message = {
          id: serverMsgId,
          type: "txt",
          msg: message,
          senderId: userId ?? "",
          senderUsername: username ?? "unknown",
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
        console.error("Error sending text message:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatType, targetId, adjustMessageInputHeight, message, userId, username],
  );

  const handleFileMessageSend = useCallback(
    async (
      type: "img" | "audio" | "video" | "file",
      file: AgoraChat.FileObj,
    ) => {
      const options: AgoraChat.CreateMsgType = {
        type,
        file,
        filename: file.filename,
        to: targetId,
        chatType,
        ext: {
          senderUsername: username ?? "unknown",
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
            senderId: userId ?? "",
            senderUsername: username ?? "unknown",
            recipientId: msg.to,
            time: Date.now(),
          },
        ]);
      } catch (err) {
        alert.error(
          `An error occurred while sending ${type} message. Please try again`,
        );
        console.error(`Error sending ${type} message:`, err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatType, targetId, userId, username],
  );

  const handleAudioMessageSend = useCallback(
    async (blob: Blob) => {
      const filename = "audio.mp3";
      const filetype = "audio/mp3";
      const file: AgoraChat.FileObj = {
        data: new File([blob], filename, { type: filetype }),
        filename,
        filetype,
        url: "",
      };

      await handleFileMessageSend("audio", file);
    },
    [handleFileMessageSend],
  );

  const handleEmojiAdd = useCallback(
    async (emojiUnified: string) => {
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
    },
    [adjustMessageInputHeight],
  );

  const handleReactionAdd = useCallback(
    async (messageId: string, emojiUnified: string) => {
      try {
        await connection.addReaction({
          messageId: messageId,
          reaction: emojiUnified,
        });
      } catch (err) {
        const reactionErr = err as { type: number; message: string };

        if (reactionErr?.type === ERROR_CODES.REACTION_ALREADY_ADDED)
          alert.info("Reaction is already added");
        else alert.info("Something went wrong");

        console.error("Error adding reaction:", reactionErr);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleReactionRemove = useCallback(
    async (messageId: string) => {
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
          console.error("Error removing reaction:", err);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getLocalUserReactions],
  );

  const handleReactionClick = useCallback(
    async (messageId: string, emojiUnified?: string) => {
      if (emojiUnified) {
        const localUserReactions = getLocalUserReactions(messageId);
        const isReactionSelected = localUserReactions?.find(
          (reaction) => reaction.reaction === emojiUnified,
        );

        await handleReactionRemove(messageId);

        if (!isReactionSelected)
          await handleReactionAdd(messageId, emojiUnified);
      } else setEmojiPickerState({ isOpened: true, messageId });
    },
    [getLocalUserReactions, handleReactionAdd, handleReactionRemove],
  );

  const handleEmojiClick = useCallback(
    async (data: EmojiClickData) => {
      const messageId = emojiPickerState?.messageId;

      if (messageId) {
        await handleReactionClick(messageId, data.unified);
        setEmojiPickerState({ isOpened: false });
      } else await handleEmojiAdd(data.unified);
    },
    [emojiPickerState?.messageId, handleEmojiAdd, handleReactionClick],
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];

      if (selectedFile && fileInputRef.current) {
        const filetype = selectedFile.type;
        const file = AC.utils.getFileUrl(fileInputRef.current);

        if (filetype.startsWith("image/")) {
          await handleFileMessageSend("img", file);
        } else if (filetype.startsWith("audio/")) {
          await handleFileMessageSend("audio", file);
        } else if (filetype.startsWith("video/")) {
          await handleFileMessageSend("video", file);
        } else {
          await handleFileMessageSend("file", file);
        }
      }
    },
    [handleFileMessageSend],
  );

  const handleMessagesViewScroll = useCallback(async () => {
    if (
      !areMessagesFetchingRef.current &&
      messagesCursorRef.current !== "undefined"
    )
      await getMessages();
  }, [getMessages]);

  const handleSmileBtnClick = useCallback(
    () =>
      setEmojiPickerState((prevState) => ({
        isOpened: !prevState.isOpened,
      })),
    [],
  );

  const handleMicrophoneBtnClick = useCallback(
    () => setIsRecordingAudio(true),
    [],
  );

  const handlePaperclipBtnClick = useCallback(
    () => fileInputRef.current?.click(),
    [],
  );

  const handleRecordedAudioSubmit = useCallback(
    async (blob: Blob) => {
      await handleAudioMessageSend(blob);
      setIsRecordingAudio(false);
    },
    [handleAudioMessageSend],
  );

  const handleRecordingCancel = useCallback(
    () => setIsRecordingAudio(false),
    [],
  );

  useEffect(() => {
    getMessages();
  }, [getMessages]);

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

      if (parsedMessage) setMessages((prev) => [...prev, parsedMessage]);
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

  const messageGroups = useMemo(() => groupMessages(messages), [messages]);

  return (
    <div className="flex h-full max-h-full w-full flex-col overflow-hidden bg-deep-black">
      <ChatMessagesView
        messageGroups={messageGroups}
        onReactionClick={handleReactionClick}
        onScroll={handleMessagesViewScroll}
      />

      <div className="relative flex flex-col gap-2 border-t border-lightgrey p-2">
        <ChatForm
          ref={messageInputRef}
          message={message}
          onMessageInput={handleTextMessageInput}
          onSubmit={handleTextMessageSend}
        />

        <ChatToolbar
          ref={fileInputRef}
          isEmojiPickerOpen={emojiPickerState.isOpened}
          onSmileBtnClick={handleSmileBtnClick}
          onMicrophoneBtnClick={handleMicrophoneBtnClick}
          onPaperclipBtnClick={handlePaperclipBtnClick}
          onFileUpload={handleFileUpload}
        />

        {isRecordingAudio && (
          <AudioRecorder
            onSubmit={handleRecordedAudioSubmit}
            onCancel={handleRecordingCancel}
          />
        )}

        {emojiPickerState.isOpened && (
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
      </div>
    </div>
  );
};

const MemoizedChat = memo(Chat);

export default MemoizedChat;
