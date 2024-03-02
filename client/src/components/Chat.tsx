import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import AC, { AgoraChat } from "agora-chat";
import { useAlert } from "react-alert";
import { BiSend, BiSmile, BiMicrophone, BiPaperclip } from "react-icons/bi";
import MessageGroup from "./MessageGroup";
import AudioRecorder from "./AudioRecorder";
import SimpleButton from "./SimpleButton";
import useChatConnection from "../hooks/useChatConnection";
import groupMessages from "../utils/groupMessages";
import ChatConfig from "../config/ChatConfig";
import type Message from "../types/Message";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const connection = useChatConnection();
  const alert = useAlert();

  const handleTextMessageInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
      messageInputRef.current.style.height = `${
        event.target.scrollHeight + 2
      }px`;
    }
    setMessage(event.target.value);
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

      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto";
      }
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
          msg: file.url,
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

  useEffect(() => {
    const handleFileMessage = async (
      message:
        | AgoraChat.ImgMsgBody
        | AgoraChat.AudioMsgBody
        | AgoraChat.VideoMsgBody
        | AgoraChat.FileMsgBody,
    ) => {
      const url = message.url;

      if (url) {
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            type: message.type,
            msg: url,
            senderId: message.from,
            senderUsername: message.ext?.senderUsername,
            recipientId: message.to,
            time: message.time,
          },
        ]);
      }
    };

    connection.addEventHandler("message", {
      onTextMessage: (message) => {
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            type: message.type,
            msg: message.msg,
            senderId: message.from,
            senderUsername: message.ext?.senderUsername,
            recipientId: message.to,
            time: message.time,
          },
        ]);
      },
      onImageMessage: handleFileMessage,
      onAudioMessage: handleFileMessage,
      onVideoMessage: handleFileMessage,
      onFileMessage: handleFileMessage,
    });

    return () => {
      connection.removeEventHandler("message");
    };
  }, [connection]);

  const messageGroups = groupMessages(messages);

  return (
    <div className="flex h-full flex-col bg-deep-black">
      <div className="flex h-full flex-col gap-4 overflow-auto px-1 py-2 sm:px-2 sm:py-3">
        {messageGroups.map((group) => (
          <MessageGroup
            key={group.id}
            {...group}
            isLocalUser={group.messages.at(0)?.senderId === ChatConfig.uid}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-lightgrey p-2">
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
          <SimpleButton>
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
