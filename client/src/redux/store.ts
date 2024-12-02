import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createFilter } from "redux-persist-transform-filter";

import authReducer, { AuthState } from "./authSlice";
import rtcReducer, { RTCState } from "./rtcSlice";
import rtmReducer, { RTMState } from "./rtmSlice";
import chatReducer, { ChatState } from "./chatSlice";
import { authApi } from "../services/authApi";
import { userApi } from "../services/userApi";
import { requestApi } from "../services/requestApi";
import { channelApi } from "../services/channelApi";
import { contactApi } from "../services/contactApi";
import { whiteboardApi } from "../services/whiteboardApi";
import { tokenApi } from "../services/tokenApi";
import { fileApi } from "../services/fileApi";

interface RootState {
  auth: AuthState;
  rtc: RTCState;
  rtm: RTMState;
  chat: ChatState;
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
  [requestApi.reducerPath]: ReturnType<typeof requestApi.reducer>;
  [channelApi.reducerPath]: ReturnType<typeof channelApi.reducer>;
  [contactApi.reducerPath]: ReturnType<typeof contactApi.reducer>;
  [whiteboardApi.reducerPath]: ReturnType<typeof whiteboardApi.reducer>;
  [tokenApi.reducerPath]: ReturnType<typeof tokenApi.reducer>;
  [fileApi.reducerPath]: ReturnType<typeof fileApi.reducer>;
}

const saveAuthSubsetFilter = createFilter("auth", [
  "userToken",
  "userId",
  "username",
]);
const saveRtcSubsetFilter = createFilter("rtc", [
  "isVirtualBgEnabled",
  "virtualBgType",
  "virtualBgBlurDegree",
  "virtualBgColor",
  "virtualBgImgId",
  "virtualBgVideoId",
  "isNoiseSuppressionEnabled",
  "noiseSuppressionMode",
  "noiseSuppressionLevel",
  "isPitchShiftEnabled",
  "pitchFactor",
  "isChatDisplayed",
]);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "rtc"],
  transforms: [saveAuthSubsetFilter, saveRtcSubsetFilter],
};

const rootReducer = combineReducers({
  auth: authReducer,
  rtc: rtcReducer,
  rtm: rtmReducer,
  chat: chatReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [requestApi.reducerPath]: requestApi.reducer,
  [channelApi.reducerPath]: channelApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [whiteboardApi.reducerPath]: whiteboardApi.reducer,
  [tokenApi.reducerPath]: tokenApi.reducer,
  [fileApi.reducerPath]: fileApi.reducer,
});

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(requestApi.middleware)
      .concat(channelApi.middleware)
      .concat(contactApi.middleware)
      .concat(whiteboardApi.middleware)
      .concat(tokenApi.middleware)
      .concat(fileApi.middleware),
});

export default store;
export const persistor = persistStore(store);
export type { RootState };
export type AppDispatch = typeof store.dispatch;
