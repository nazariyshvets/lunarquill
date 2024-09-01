import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createFilter } from "redux-persist-transform-filter";

import authReducer, { AuthState } from "./authSlice";
import rtcReducer, { RTCState } from "./rtcSlice";
import rtmReducer, { RTMState } from "./rtmSlice";
import chatReducer, { ChatState } from "./chatSlice";
import { mainApi } from "../services/mainService";

interface RootState {
  auth: AuthState;
  rtc: RTCState;
  rtm: RTMState;
  chat: ChatState;
  [mainApi.reducerPath]: ReturnType<typeof mainApi.reducer>;
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
  [mainApi.reducerPath]: mainApi.reducer,
});

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(mainApi.middleware),
});

export default store;
export const persistor = persistStore(store);
export type { RootState };
export type AppDispatch = typeof store.dispatch;
