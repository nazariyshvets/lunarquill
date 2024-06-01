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
}

const initialState: RTMState = {
  isRTMClientInitialized: false,
  callModalState: null,
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
  },
});

export const { setIsRTMClientInitialized, setCallModalState } =
  rtmSlice.actions;
export default rtmSlice.reducer;
