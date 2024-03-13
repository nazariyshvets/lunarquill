import { PropsWithChildren, ButtonHTMLAttributes } from "react";

interface SimpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const SimpleButton = ({
  children,
  isActive,
  ...rest
}: PropsWithChildren<SimpleButtonProps>) => {
  return (
    <button
      className={`p-2 transition-colors ${
        isActive ? "text-primary-light" : "text-white hover:text-primary-light"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SimpleButton;
