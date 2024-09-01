import React, { forwardRef, memo } from "react";

import { BiSend } from "react-icons/bi";

import SimpleButton from "./SimpleButton";

interface ChatFormProps {
  message: string;
  onMessageInput: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ChatForm = forwardRef<HTMLTextAreaElement, ChatFormProps>(
  ({ message, onMessageInput, onSubmit }, messageInputRef) => (
    <form method="POST" onSubmit={onSubmit} className="flex items-end">
      <textarea
        ref={messageInputRef}
        value={message}
        rows={1}
        placeholder="Message..."
        className="ml-2 max-h-[4rem] w-full resize-none border-b-2 border-white bg-transparent px-2 text-sm text-white caret-primary-light outline-none placeholder:text-lightgrey focus:border-primary-light sm:max-h-[4.6rem] sm:text-base"
        onInput={onMessageInput}
      />

      <SimpleButton>
        <BiSend className="text-xl sm:text-2xl" />
      </SimpleButton>
    </form>
  ),
);

const MemoizedChatForm = memo(ChatForm);

export default MemoizedChatForm;
