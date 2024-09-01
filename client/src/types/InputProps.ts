import { InputHTMLAttributes, ReactNode } from "react";

import {
  Path,
  UseFormRegister,
  FieldValues,
  Validate,
  FieldError,
} from "react-hook-form";

interface InputProps<TFormValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "pattern"> {
  name: Path<TFormValues>;
  register: UseFormRegister<TFormValues>;
  type?: "text" | "password" | "checkbox";
  errors?: FieldError;
  pattern?: RegExp;
  validate?:
    | Validate<string, TFormValues>
    | Record<string, Validate<string, TFormValues>>;
  label?: string;
}

interface InputWithIconProps<TFormValues extends FieldValues>
  extends InputProps<TFormValues> {
  icon: ReactNode;
  containerClassName?: string;
}

export type { InputProps, InputWithIconProps };
