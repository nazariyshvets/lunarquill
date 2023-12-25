import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import InputProps from "../types/InputProps";

interface InputWithIconProps<TFormValues extends FieldValues>
  extends InputProps<TFormValues> {
  icon: ReactNode;
  containerClassName?: string;
}

export default InputWithIconProps;
