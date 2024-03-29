import {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import AC, { AgoraChat } from "agora-chat";
import * as _ from "lodash";
import { useAlert } from "react-alert";
import EmojiPicker, {
  EmojiStyle,
  Theme,
  EmojiClickData,
} from "emoji-picker-react";
import { BiMicrophone, BiPaperclip, BiSend, BiSmile } from "react-icons/bi";
import MessageGroup from "./MessageGroup";
import AudioRecorder from "./AudioRecorder";
import SimpleButton from "./SimpleButton";
import useChatConnection from "../hooks/useChatConnection";
import groupMessages from "../utils/groupMessages";
import parseMessage from "../utils/parseMessage";
import ChatConfig from "../config/ChatConfig";
import type Message from "../types/Message";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpened, setIsEmojiPickerOpened] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const areMessagesFetchingRef = useRef(false);
  const messagesCursorRef = useRef<string>();
  const connection = useChatConnection();
  const alert = useAlert();

  const adjustMessageInputHeight = () => {
    const messageInput = messageInputRef.current;

    if (messageInput) {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight + 2}px`;
    }
  };

  const handleTextMessageInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    adjustMessageInputHeight();
  };

  const handleEmojiAdd = (data: EmojiClickData) => {
    const messageInput = messageInputRef.current;

    if (messageInput) {
      setMessage(
        (prevState) =>
          prevState.slice(0, messageInput.selectionStart) +
          data.emoji +
          prevState.slice(messageInput.selectionEnd),
      );
      messageInput.focus();
    }

    adjustMessageInputHeight();
  };

  const handleTextMessageSend = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleAudioMessageSend = async (blob: Blob) => {
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
    if (!fileInputRef.current) {
      return;
    }

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

  const handleRecordedAudioSubmit = (blob: Blob) => {
    handleAudioMessageSend(blob);
    setIsRecordingAudio(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

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
          />
        ))}
      </div>

      <div className="relative flex flex-col gap-2 border-t border-lightgrey p-2">
        <form
          method="POST"
          onSubmit={handleTextMessageSend}
          className="flex items-end"
        >
          <textarea
            ref={messageInputRef}
            value={message}
            rows={1}
            placeholder="Message..."
            className="ml-2 max-h-[4rem] w-full resize-none border-b-2 border-white bg-transparent px-2 text-sm text-white caret-primary-light outline-none placeholder:text-lightgrey focus:border-primary-light sm:max-h-[4.6rem] sm:text-base"
            onInput={handleTextMessageInput}
          />

          <SimpleButton>
            <BiSend className="text-xl sm:text-2xl" />
          </SimpleButton>
        </form>

        <div className="flex items-center">
          <SimpleButton
            isActive={isEmojiPickerOpened}
            onClick={() => setIsEmojiPickerOpened((prevState) => !prevState)}
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

        {isEmojiPickerOpened && (
          <div className="absolute bottom-full left-0">
            <EmojiPicker
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              skinTonesDisabled
              onEmojiClick={handleEmojiAdd}
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
