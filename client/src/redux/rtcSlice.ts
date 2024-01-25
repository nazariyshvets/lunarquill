import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";
import isValidHexColorCode from "../utils/isValidHexColorCode";
import isImage from "../utils/isImage";
import isVideo from "../utils/isVideo";
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
  virtualBgImgSource: File | null;
  virtualBgVideoSource: File | null;
}

const initialState: RTCState = {
  localCameraTrack: null,
  localMicrophoneTrack: null,
  isVirtualBgEnabled: false,
  virtualBgType: "blur",
  virtualBgBlurDegree: 2,
  virtualBgColor: "#00ff00",
  virtualBgImgSource: null,
  virtualBgVideoSource: null,
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
    setVirtualBgImgSource: (state, { payload }: PayloadAction<File>) => {
      if (isImage(payload)) {
        state.virtualBgImgSource = payload;
      }
    },
    setVirtualBgVideoSource: (state, { payload }: PayloadAction<File>) => {
      if (isVideo(payload)) {
        state.virtualBgVideoSource = payload;
      }
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
  setVirtualBgImgSource,
  setVirtualBgVideoSource,
} = rtcSlice.actions;
export default rtcSlice.reducer;
