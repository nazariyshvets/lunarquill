import { FieldValues } from "react-hook-form";

import Input from "../components/Input";
import type { InputWithIconProps } from "../types/InputProps";

const InputWithIcon = <T extends FieldValues>({
  icon,
  containerClassName = "",
  ...rest
}: InputWithIconProps<T>) => (
  <div className={`flex ${containerClassName}`}>
    <div className="flex h-10 w-14 items-center justify-center rounded-[5px_0_0_5px] border border-grey bg-gradient-to-b from-charcoal to-black text-lightgrey sm:h-12 sm:text-xl">
      {icon}
    </div>
    <Input {...rest} />
  </div>
);

export default InputWithIcon;
