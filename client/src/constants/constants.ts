import { positions, transitions } from "react-alert";

const USERNAME_PATTERN = /^[\w-]+$/;
const ALPHANUMERIC_START_END_PATTERN = /^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/;
const NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN =
  /^(?!.*[-_]{2})[a-zA-Z0-9_-]+$/;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const ALERT_OPTIONS = {
  offset: "10px",
  position: positions.TOP_CENTER,
  timeout: 5000,
  transition: transitions.SCALE,
};

const BASE_SERVER_URL = "http://127.0.0.1:8000";

const MOBILE_SCREEN_THRESHOLD = 640;
const LAPTOP_SCREEN_THRESHOLD = 1280;

export {
  USERNAME_PATTERN,
  ALPHANUMERIC_START_END_PATTERN,
  NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN,
  EMAIL_PATTERN,
  ALERT_OPTIONS,
  BASE_SERVER_URL,
  MOBILE_SCREEN_THRESHOLD,
  LAPTOP_SCREEN_THRESHOLD,
};
