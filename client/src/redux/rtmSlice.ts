import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import CallDirection from "../types/CallDirection";
import type { UserWithoutPassword } from "../types/User";

interface CallModal {
  callDirection: CallDirection;
  contact: UserWithoutPassword;
}

export interface RTMState {
  isRTMClientInitialized: boolean;
  callModalState: CallModal | null;
  callTimeout: number | null;
  onlineContactIds: string[];
}

const initialState: RTMState = {
  isRTMClientInitialized: false,
  callModalState: null,
  callTimeout: null,
  onlineContactIds: [],
};

const rtmSlice = createSlice({
  name: "rtm",
  initialState,
  reducers: {
    setIsRTMClientInitialized: (state, { payload }: PayloadAction<boolean>) => {
      state.isRTMClientInitialized = payload;
    },
    setCallModalState: (
      state,
      { payload }: PayloadAction<CallModal | null>,
    ) => {
      state.callModalState = payload;
    },
    setCallTimeout: (state, { payload }: PayloadAction<number | null>) => {
      state.callTimeout = payload;
    },
    setOnlineContactIds: (state, { payload }: PayloadAction<string[]>) => {
      state.onlineContactIds = payload;
    },
  },
});

export const {
  setIsRTMClientInitialized,
  setCallModalState,
  setCallTimeout,
  setOnlineContactIds,
} = rtmSlice.actions;
export default rtmSlice.reducer;
