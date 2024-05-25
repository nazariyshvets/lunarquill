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
  type = "text",
  className = "",
  label,
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

  const inputStyles =
    type === "checkbox"
      ? "appearance-none w-6 h-6 border-2 border-charcoal rounded-md bg-transparent cursor-pointer relative checked:before:absolute checked:before:top-0 checked:before:left-[6px] checked:bg-charcoal checked:before:content-[''] checked:before:block checked:before:w-2 checked:before:h-4 checked:before:border-2 checked:before:border-primary-light checked:before:border-t-0 checked:before:border-l-0 checked:before:transform checked:before:rotate-45 focus:outline-none focus:shadow-none"
      : "h-10 w-full rounded-[0_5px_5px_0] border border-grey bg-transparent bg-gradient-to-b from-charcoal to-black px-4 text-lightgrey caret-primary outline-none focus:animate-input focus:text-primary focus:shadow-input disabled:cursor-not-allowed sm:h-12 sm:text-xl";

  return (
    <div className="flex w-full flex-col items-start gap-y-1 text-left">
      <div className="flex w-full items-center gap-2">
        <input
          type={type}
          {...register(name, {
            required,
            minLength,
            maxLength,
            pattern,
            validate,
          })}
          className={`${inputStyles} ${className}`}
          {...rest}
        />
        {type === "checkbox" && <span className="text-white">{label}</span>}
      </div>
      {errorMessage && <InputError message={errorMessage} />}
    </div>
  );
};

export default Input;
