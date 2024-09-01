import { AlertTemplateProps } from "react-alert";
import {
  FaCircleInfo,
  FaCircleCheck,
  FaCircleExclamation,
  FaXmark,
} from "react-icons/fa6";

const TYPE_ICON_MAP = {
  info: <FaCircleInfo />,
  success: <FaCircleCheck />,
  error: <FaCircleExclamation />,
};

const TYPE_CLASS_MAP = {
  info: { borderColor: "border-blue-500", textColor: "text-blue-500" },
  success: { borderColor: "border-green-500", textColor: "text-green-500" },
  error: { borderColor: "border-red-500", textColor: "text-red-500" },
};

const AlertTemplate = ({
  style,
  options,
  message,
  close,
}: AlertTemplateProps) => {
  const { type = "info" } = options;
  const { borderColor, textColor } = TYPE_CLASS_MAP[type];

  return (
    <div
      className={`flex items-center justify-center gap-x-4 rounded-md border bg-black p-4 ${borderColor}`}
      style={style}
    >
      <div className={textColor}>{TYPE_ICON_MAP[type]}</div>
      <p className={`break-all text-center ${textColor}`}>{message}</p>
      <button className={`text-base ${textColor}`} onClick={close}>
        <FaXmark />
      </button>
    </div>
  );
};

export default AlertTemplate;
