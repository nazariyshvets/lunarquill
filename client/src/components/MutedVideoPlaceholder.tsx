interface MutedVideoPlaceholderProps {
  text: string;
}

const MutedVideoPlaceholder = ({ text }: MutedVideoPlaceholderProps) => (
  <div className="flex h-full w-full items-center justify-center bg-charcoal p-2 font-medium text-white sm:text-xl">
    <div className="line-clamp-2 break-words text-center">{text}</div>
  </div>
);

export default MutedVideoPlaceholder;
