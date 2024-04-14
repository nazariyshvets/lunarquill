import { ButtonHTMLAttributes, PropsWithChildren } from "react";

const Button = ({
  className = "",
  children,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
  <button
    className={`h-10 w-full cursor-pointer rounded border border-grey bg-gradient-to-b from-charcoal to-black px-4 font-bold tracking-[1px] text-lightgrey caret-primary enabled:hover:border-primary enabled:hover:text-primary enabled:hover:shadow-button disabled:cursor-not-allowed sm:h-12 sm:text-xl ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
