import { PropsWithChildren, ButtonHTMLAttributes } from "react";

const RTCControlButton = ({
  children,
  className,
  onClick,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button
      className={`h-10 w-10 rounded-full p-2 transition-shadow hover:shadow-button sm:h-14 sm:w-14 sm:p-3 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default RTCControlButton;
