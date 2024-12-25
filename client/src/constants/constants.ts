import { Bounce, ToastOptions } from "react-toastify";

import Placement from "../types/Placement";

const USERNAME_PATTERN = /^[\w-]+$/;
const ALPHANUMERIC_START_END_PATTERN = /^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/;
const NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN =
  /^(?!.*[-_]{2})[a-zA-Z0-9_-]+$/;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const HEX_COLOR_PATTERN =
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

const TOAST_OPTIONS: ToastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
  transition: Bounce,
};
const DROPDOWN_PLACEMENT_TO_STYLES_MAP: Record<Placement, string> = {
  [Placement.TOP_LEFT]: "bottom-[calc(100%+1rem)] left-0",
  [Placement.TOP_CENTER]:
    "bottom-[calc(100%+1rem)] left-1/2 transform -translate-x-1/2 justify-center",
  [Placement.TOP_RIGHT]: "bottom-[calc(100%+1rem)] right-0 justify-end",

  [Placement.LEFT_TOP]: "right-[calc(100%+1rem)] top-0 justify-end",
  [Placement.LEFT_CENTER]:
    "right-[calc(100%+1rem)] top-1/2 transform -translate-y-1/2 justify-end",
  [Placement.LEFT_BOTTOM]: "right-[calc(100%+1rem)] bottom-0 justify-end",

  [Placement.RIGHT_TOP]: "left-[calc(100%+1rem)] top-0",
  [Placement.RIGHT_CENTER]:
    "left-[calc(100%+1rem)] top-1/2 transform -translate-y-1/2",
  [Placement.RIGHT_BOTTOM]: "left-[calc(100%+1rem)] bottom-0",

  [Placement.BOTTOM_LEFT]: "top-[calc(100%+1rem)] left-0",
  [Placement.BOTTOM_CENTER]:
    "top-[calc(100%+1rem)] left-1/2 transform -translate-x-1/2 justify-center",
  [Placement.BOTTOM_RIGHT]: "top-[calc(100%+1rem)] right-0 justify-end",
};

const BASE_CLIENT_URL = "http://127.0.0.1:3000";
const BASE_SERVER_URL = "http://127.0.0.1:8000";

const MOBILE_SCREEN_THRESHOLD = 640;
const LAPTOP_SCREEN_THRESHOLD = 1280;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
const IMAGES_IN_STORAGE_LIMIT = 10;
const VIDEOS_IN_STORAGE_LIMIT = 10;

enum ERROR_CODES {
  REACTION_ALREADY_ADDED = 1101,
}

enum QUERY_TAG_TYPES {
  USER_DETAILS = "UserDetails",
  USER_REQUESTS = "UserRequests",
  USER_CONTACTS = "UserContacts",
  USER_CHANNELS = "UserChannels",
  CHANNEL = "Channel",
  CHANNEL_MEMBERS = "ChannelMembers",
}

const CALL_TIMEOUT_MS = 30_000;

const TOKEN_EXPIRY_TIME = 3600;

const SHOOTING_STARS_COUNT = 10;

export {
  USERNAME_PATTERN,
  ALPHANUMERIC_START_END_PATTERN,
  NO_CONSECUTIVE_HYPHEN_UNDERSCORE_PATTERN,
  EMAIL_PATTERN,
  HEX_COLOR_PATTERN,
  TOAST_OPTIONS,
  DROPDOWN_PLACEMENT_TO_STYLES_MAP,
  BASE_CLIENT_URL,
  BASE_SERVER_URL,
  MOBILE_SCREEN_THRESHOLD,
  LAPTOP_SCREEN_THRESHOLD,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  IMAGES_IN_STORAGE_LIMIT,
  VIDEOS_IN_STORAGE_LIMIT,
  ERROR_CODES,
  QUERY_TAG_TYPES,
  CALL_TIMEOUT_MS,
  TOKEN_EXPIRY_TIME,
  SHOOTING_STARS_COUNT,
};
