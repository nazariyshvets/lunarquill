interface InputErrorProps {
  message: string;
}

const InputError = ({ message }: InputErrorProps) => (
  <p className="text-xs text-lightgrey first-letter:capitalize sm:text-base">
    {message}
  </p>
);

export default InputError;
