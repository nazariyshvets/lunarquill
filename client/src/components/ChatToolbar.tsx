import React, { forwardRef, memo } from "react";

import { BiMicrophone, BiPaperclip, BiSmile } from "react-icons/bi";

import SimpleButton from "./SimpleButton";

interface ChatToolbarProps {
  isEmojiPickerOpen: boolean;
  onSmileBtnClick: () => void;
  onMicrophoneBtnClick: () => void;
  onPaperclipBtnClick: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ChatToolbar = forwardRef<HTMLInputElement, ChatToolbarProps>(
  (
    {
      isEmojiPickerOpen,
      onSmileBtnClick,
      onMicrophoneBtnClick,
      onPaperclipBtnClick,
      onFileUpload,
    },
    fileInputRef,
  ) => (
    <div className="flex items-center">
      <SimpleButton isActive={isEmojiPickerOpen} onClick={onSmileBtnClick}>
        <BiSmile className="text-lg sm:text-xl" />
      </SimpleButton>
      <SimpleButton onClick={onMicrophoneBtnClick}>
        <BiMicrophone className="text-lg sm:text-xl" />
      </SimpleButton>
      <SimpleButton onClick={onPaperclipBtnClick}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileUpload}
        />
        <BiPaperclip className="-rotate-45 text-lg sm:text-xl" />
      </SimpleButton>
    </div>
  ),
);

const MemoizedChatToolbar = memo(ChatToolbar);

export default MemoizedChatToolbar;
