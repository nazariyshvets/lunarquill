interface TextMessageProps {
  message: string;
  isLocalUser?: boolean;
}

const TextMessage = ({ message, isLocalUser }: TextMessageProps) => (
  <p
    className={`hyphens-auto break-all text-sm text-white sm:text-base ${
      isLocalUser ? "text-end" : ""
    }`}
  >
    {message}
  </p>
);

export default TextMessage;
