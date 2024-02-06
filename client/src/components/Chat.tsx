import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import AC, { AgoraChat } from "agora-chat";
import { BiSend } from "react-icons/bi";
import useChatConnection from "../hooks/useChatConnection";
import groupMessages, { type GroupedMessage } from "../utils/groupMessages";
import formatTime from "../utils/formatTime";
import ChatConfig from "../config/ChatConfig";
import type Message from "../types/Message";

interface MessageGroupProps extends GroupedMessage {
  isLocalUser?: boolean;
}

interface MessageRowProps {
  message: Message;
  displayUsername?: boolean;
  isLocalUser?: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const connection = useChatConnection();

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
      messageInputRef.current.style.height = `${
        event.target.scrollHeight + 2
      }px`;
    }
    setMessage(event.target.value);
  };

  const handleMessageSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const options: AgoraChat.CreateMsgType = {
      type: "txt",
      msg: message,
      to: ChatConfig.chatId,
      chatType: "groupChat",
      ext: {
        username: ChatConfig.username,
      },
    };

    try {
      const msg = AC.message.create(options);
      await connection.send(msg);

      const currentMessage = message;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
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

  useEffect(() => {
    connection.addEventHandler("message", {
      onTextMessage: ({ id, msg, from, to, time, ext }) => {
        setMessages((prev) => [
          ...prev,
          {
            id,
            msg,
            senderId: from,
            senderUsername: ext?.username,
            recipientId: to,
            time,
          },
        ]);
      },
    });

    return () => {
      connection.removeEventHandler("message");
    };
  }, [connection]);

  const messageGroups = groupMessages(messages);

  return (
    <div className="flex h-full w-full flex-col bg-deep-black">
      <div className="flex h-full flex-col gap-4 overflow-auto px-1 py-2 sm:px-2 sm:py-3">
        {messageGroups.map((group) => (
          <MessageGroup
            key={group.id}
            {...group}
            isLocalUser={group.messages.at(0)?.senderId === ChatConfig.uid}
          />
        ))}
      </div>
      <form
        method="POST"
        onSubmit={handleMessageSend}
        className="flex items-center border-t border-lightgrey py-4 pl-4 pr-2 sm:pl-6 sm:pr-4"
      >
        <textarea
          ref={messageInputRef}
          value={message}
          rows={1}
          placeholder="Message..."
          className="max-h-[4rem] w-full resize-none border-b-2 border-white bg-transparent px-2 text-sm text-white caret-primary-light outline-none placeholder:text-lightgrey focus:border-primary-light sm:max-h-[4.6rem] sm:text-base"
          onInput={handleInput}
        />
        <button className="p-2 text-white transition-colors hover:text-primary-light">
          <BiSend className="text-xl sm:text-2xl" />
        </button>
      </form>
    </div>
  );
};

const MessageGroup = ({
  messages,
  displayDate,
  isLocalUser = false,
}: MessageGroupProps) => {
  return (
    <div className="flex flex-col gap-4">
      {displayDate && (
        <span className="truncate text-center text-sm text-lightgrey sm:text-base">
          {displayDate}
        </span>
      )}

      <div
        className={`flex max-w-[calc(100%-2.25rem)] ${
          isLocalUser ? "flex-row-reverse self-end" : ""
        }`}
      >
        <div className="relative h-12 w-12 flex-shrink-0 rounded-full border-4 border-deep-black bg-primary-light"></div>
        <div
          className={`flex max-w-full flex-col gap-1 ${
            isLocalUser ? "-mr-4 items-end" : "-ml-4 items-start"
          }`}
        >
          {messages.map((message, i) => (
            <MessageRow
              key={message.id}
              message={message}
              isLocalUser={isLocalUser}
              displayUsername={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const MessageRow = ({
  message,
  displayUsername = false,
  isLocalUser = false,
}: MessageRowProps) => {
  return (
    <div
      className={`flex max-w-full flex-col gap-1 rounded bg-charcoal py-1 ${
        isLocalUser
          ? "items-end pl-2 pr-6 outline outline-1 outline-lightgrey"
          : "pl-6 pr-2"
      }`}
    >
      {displayUsername && (
        <span className="truncate text-sm font-medium tracking-wider text-primary-light sm:text-base">
          {isLocalUser ? "You" : message.senderUsername}
        </span>
      )}

      <div
        className={`flex items-end gap-2 sm:gap-4 ${
          isLocalUser ? "flex-row-reverse" : ""
        }`}
      >
        <p
          className={`hyphens-auto break-all text-sm text-white sm:text-base ${
            isLocalUser ? "text-end" : ""
          }`}
        >
          {message.msg}
        </p>
        <i className="text-[0.625rem] text-lightgrey sm:text-xs">
          {formatTime(message.time)}
        </i>
      </div>
    </div>
  );
};

export default Chat;
