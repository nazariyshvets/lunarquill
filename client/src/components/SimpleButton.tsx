import { PropsWithChildren, ButtonHTMLAttributes } from "react";

export interface SimpleButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  isDanger?: boolean;
}

const SimpleButton = ({
  isActive = false,
  isDanger = false,
  className = "",
  children,
  ...rest
}: PropsWithChildren<SimpleButtonProps>) => (
  <button
    className={`p-2 transition-colors ${
      isActive
        ? isDanger
          ? "text-danger"
          : "text-primary-light"
        : `text-white ${
            isDanger ? "hover:text-danger" : "hover:text-primary-light"
          }`
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default SimpleButton;
