import type Size from "../types/Size";

interface ContactProps {
  name: string;
  isOnline: boolean;
  size?: Size;
  onClick?: () => void;
}

const SIZE_STYLES_MAP: Record<Size, string> = {
  sm: "h-8 w-8 text-sm sm:h-9 sm:w-9 xl:h-10 xl:w-10",
  md: "h-10 w-10 text-base sm:h-11 sm:w-11 xl:h-12 xl:w-12",
  lg: "h-12 w-12 text-lg sm:h-[52px] sm:w-[52px] xl:h-14 xl:w-14",
};

const Contact = ({ name, isOnline, size = "md", onClick }: ContactProps) => (
  <div
    className={`flex max-w-full items-center gap-1 overflow-hidden ${
      onClick ? "cursor-pointer" : ""
    }`}
    onClick={onClick}
  >
    <div
      className={`relative flex flex-shrink-0 items-center justify-center rounded-full bg-charcoal text-white ${SIZE_STYLES_MAP[size]}`}
    >
      {name.slice(0, 2).toUpperCase()}
      {isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary" />
      )}
    </div>
    <span className="max-w-full truncate text-sm font-medium text-white">
      {name}
    </span>
  </div>
);

export default Contact;
