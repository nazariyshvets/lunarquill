import { FieldError, FieldValues } from "react-hook-form";

import InputError from "./InputError";
import type InputProps from "../types/InputProps";

const Input = <T extends FieldValues>({
  name,
  register,
  errors,
  required,
  minLength,
  maxLength,
  pattern,
  validate,
  className = "",
  ...rest
}: InputProps<T>) => {
  const getErrorMessage = (errors: FieldError) => {
    switch (errors.type) {
      case "required":
        return "Field is required";
      case "minLength":
        return `Input length has to be at least ${minLength} characters`;
      case "maxLength":
        return `Input length has to be up to ${maxLength} characters`;
      case "pattern":
        return "Invalid input";
      default:
        return errors.message;
    }
  };

  const errorMessage = errors && getErrorMessage(errors);

  return (
    <div className="flex w-full flex-col items-start gap-y-1 text-left">
      <input
        {...register(name, {
          required,
          minLength,
          maxLength,
          pattern,
          validate,
        })}
        className={`h-10 w-full rounded-[0_5px_5px_0] border border-grey bg-transparent bg-gradient-to-b from-charcoal to-black px-4 text-lightgrey caret-primary outline-none focus:animate-input focus:text-primary focus:shadow-input disabled:cursor-not-allowed sm:h-12 sm:text-xl ${className}`}
        {...rest}
      />

      {errorMessage && <InputError message={errorMessage} />}
    </div>
  );
};

export default Input;
