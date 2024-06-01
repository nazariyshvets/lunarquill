import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatState {
  isChatInitialized: boolean;
}

const initialState: ChatState = {
  isChatInitialized: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setIsChatInitialized: (state, { payload }: PayloadAction<boolean>) => {
      state.isChatInitialized = payload;
    },
  },
});

export const { setIsChatInitialized } = chatSlice.actions;
export default chatSlice.reducer;
