import { PropsWithChildren, ButtonHTMLAttributes } from "react";

interface SimpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const SimpleButton = ({
  children,
  isActive,
  className,
  ...rest
}: PropsWithChildren<SimpleButtonProps>) => (
  <button
    className={`p-2 transition-colors ${
      isActive ? "text-primary-light" : "text-white hover:text-primary-light"
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default SimpleButton;
