import { PropsWithChildren, ButtonHTMLAttributes } from "react";

const SimpleButton = ({
  children,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button
      className="p-2 text-white transition-colors hover:text-primary-light"
      {...rest}
    >
      {children}
    </button>
  );
};

export default SimpleButton;
