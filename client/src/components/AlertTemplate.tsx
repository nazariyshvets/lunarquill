import { AlertTemplateProps } from "react-alert";
import {
  FaCircleInfo,
  FaCircleCheck,
  FaCircleExclamation,
  FaXmark,
} from "react-icons/fa6";

const typeToIconMap = {
  info: <FaCircleInfo />,
  success: <FaCircleCheck />,
  error: <FaCircleExclamation />,
};

const typeToClassMap = {
  info: { borderColor: "border-blue-500", textColor: "text-blue-500" },
  success: { borderColor: "border-green-500", textColor: "text-green-500" },
  error: { borderColor: "border-red-500", textColor: "text-red-500" },
};

function AlertTemplate({ style, options, message, close }: AlertTemplateProps) {
  const { type = "info" } = options;
  const icon = typeToIconMap[type];
  const { borderColor, textColor } = typeToClassMap[type];

  return (
    <div
      className={`flex items-center justify-center gap-x-4 rounded-md border bg-black p-4 ${borderColor}`}
      style={style}
    >
      <div className={`${textColor}`}>{icon}</div>
      <p className={`break-all text-center ${textColor}`}>{message}</p>
      <button className={`text-base ${textColor}`} onClick={close}>
        <FaXmark />
      </button>
    </div>
  );
}

export default AlertTemplate;
