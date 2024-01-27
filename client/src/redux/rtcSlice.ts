import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";
import isValidHexColorCode from "../utils/isValidHexColorCode";
import type VirtualBgType from "../types/VirtualBgType";
import type VirtualBgBlurDegree from "../types/VirtualBgBlurDegree";

export interface RTCState {
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
  // Virtual BG
  isVirtualBgEnabled: boolean;
  virtualBgType: VirtualBgType;
  virtualBgBlurDegree: VirtualBgBlurDegree;
  virtualBgColor: string;
  virtualBgImgId: string | null;
  virtualBgVideoId: string | null;
}

const initialState: RTCState = {
  localCameraTrack: null,
  localMicrophoneTrack: null,
  isVirtualBgEnabled: false,
  virtualBgType: "blur",
  virtualBgBlurDegree: 2,
  virtualBgColor: "#00ff00",
  virtualBgImgId: null,
  virtualBgVideoId: null,
};

const rtcSlice = createSlice({
  name: "rtc",
  initialState,
  reducers: {
    setLocalCameraTrack: (
      state,
      { payload }: PayloadAction<ICameraVideoTrack>,
    ) => {
      state.localCameraTrack = payload;
    },
    setLocalMicrophoneTrack: (
      state,
      { payload }: PayloadAction<IMicrophoneAudioTrack>,
    ) => {
      state.localMicrophoneTrack = payload;
    },
    setIsVirtualBgEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.isVirtualBgEnabled = payload;
    },
    setVirtualBgType: (state, { payload }: PayloadAction<VirtualBgType>) => {
      state.virtualBgType = payload;
    },
    setVirtualBgBlurDegree: (
      state,
      { payload }: PayloadAction<VirtualBgBlurDegree>,
    ) => {
      state.virtualBgBlurDegree = payload;
    },
    setVirtualBgColor: (state, { payload }: PayloadAction<string>) => {
      if (isValidHexColorCode(payload)) {
        state.virtualBgColor = payload;
      }
    },
    setVirtualBgImgId: (state, { payload }: PayloadAction<string | null>) => {
      state.virtualBgImgId = payload;
    },
    setVirtualBgVideoId: (state, { payload }: PayloadAction<string | null>) => {
      state.virtualBgVideoId = payload;
    },
  },
});

export const {
  setLocalCameraTrack,
  setLocalMicrophoneTrack,
  setIsVirtualBgEnabled,
  setVirtualBgType,
  setVirtualBgBlurDegree,
  setVirtualBgColor,
  setVirtualBgImgId,
  setVirtualBgVideoId,
} = rtcSlice.actions;
export default rtcSlice.reducer;
