import { HEX_COLOR_PATTERN } from "../constants/constants";

const isValidHexColorCode = (colorCode: string) =>
  HEX_COLOR_PATTERN.test(colorCode);

export default isValidHexColorCode;
