import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import AC, { AgoraChat } from "agora-chat";
import { nanoid } from "@reduxjs/toolkit";
import { BiSend, BiSmile, BiMicrophone, BiPaperclip } from "react-icons/bi";
import MessageGroup from "./MessageGroup";
import AudioRecorder from "./AudioRecorder";
import SimpleButton from "./SimpleButton";
import useChatConnection from "../hooks/useChatConnection";
import groupMessages from "../utils/groupMessages";
import fetchAudioFile from "../utils/fetchAudioFile";
import ChatConfig from "../config/ChatConfig";
import type Message from "../types/Message";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const connection = useChatConnection();

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

      const currentMessage = message;
      setMessages((prev) => [
        ...prev,
        {
          id: serverMsgId,
          type: "txt",
          msg: currentMessage,
          senderId: ChatConfig.uid,
          senderUsername: ChatConfig.username,
          recipientId: msg.to,
          time: Date.now(),
        },
      ]);
      setMessage("");

      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto";
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAudioMessageSend = async (blob: Blob) => {
    const filename = `${nanoid()}.mp3`;
    const filetype = "audio/mp3";
    const file: AgoraChat.FileObj = {
      data: new File([blob], filename, { type: filetype }),
      filename,
      filetype,
      url: "",
    };
    const options: AgoraChat.CreateMsgType = {
      type: "audio",
      file,
      filename,
      to: ChatConfig.chatId,
      chatType: "groupChat",
      ext: {
        senderUsername: ChatConfig.username,
      },
      onFileUploadComplete: (event) => {
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
          type: "audio",
          msg: file,
          senderId: ChatConfig.uid,
          senderUsername: ChatConfig.username,
          recipientId: msg.to,
          time: Date.now(),
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRecordedAudioSubmit = (blob: Blob) => {
    handleAudioMessageSend(blob);
    setIsRecordingAudio(false);
  };

  useEffect(() => {
    connection.addEventHandler("message", {
      onTextMessage: ({ id, type, msg, from, to, time, ext }) => {
        setMessages((prev) => [
          ...prev,
          {
            id,
            type,
            msg,
            senderId: from,
            senderUsername: ext?.senderUsername,
            recipientId: to,
            time,
          },
        ]);
      },
      onAudioMessage: async ({
        id,
        type,
        url,
        filename,
        from,
        to,
        time,
        ext,
      }) => {
        if (url) {
          try {
            const audioFile = await fetchAudioFile(url, filename);
            const file: AgoraChat.FileObj = {
              data: audioFile,
              filename,
              filetype: audioFile.type,
              url,
            };

            setMessages((prev) => [
              ...prev,
              {
                id,
                type,
                msg: file,
                senderId: from,
                senderUsername: ext?.senderUsername,
                recipientId: to,
                time,
              },
            ]);
          } catch (err) {
            console.log("Error in onAudioMessage:", err);
          }
        }
      },
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
          <SimpleButton>
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
