import Contact from "./Contact";
import type Size from "../types/Size";

interface MutedVideoPlaceholderProps {
  username: string;
  avatarId?: string;
  avatarSize?: Size;
}

const MutedVideoPlaceholder = ({
  username,
  avatarId,
  avatarSize,
}: MutedVideoPlaceholderProps) => (
  <div className="flex h-full w-full items-center justify-center bg-charcoal p-2">
    {avatarId ? (
      <Contact
        name={username}
        isOnline={false}
        avatarId={avatarId}
        size={avatarSize}
        displayName={false}
      />
    ) : (
      <span className="line-clamp-2 break-words text-center font-medium text-white sm:text-xl">
        {username}
      </span>
    )}
  </div>
);

export default MutedVideoPlaceholder;
