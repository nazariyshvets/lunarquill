import { PropsWithChildren, ButtonHTMLAttributes } from "react";

const RTCControlButton = ({
  children,
  className,
  onClick,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button
      className={`h-12 w-12 rounded-full p-3 transition-shadow hover:shadow-button sm:h-14 sm:w-14 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default RTCControlButton;
