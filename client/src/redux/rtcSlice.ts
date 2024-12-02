import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ICameraVideoTrack, ILocalAudioTrack } from "agora-rtc-react";

import isValidHexColorCode from "../utils/isValidHexColorCode";
import type { VirtualBgBlurDegree, VirtualBgType } from "../types/VirtualBg";
import type {
  NoiseSuppressionMode,
  NoiseSuppressionLevel,
} from "../types/NoiseSuppression";

export interface RTCState {
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: ILocalAudioTrack | null;
  // Virtual BG
  isVirtualBgEnabled: boolean;
  virtualBgType: VirtualBgType;
  virtualBgBlurDegree: VirtualBgBlurDegree;
  virtualBgColor: string;
  virtualBgImgId: string | null;
  virtualBgVideoId: string | null;
  // Noise Suppression
  isNoiseSuppressionEnabled: boolean;
  noiseSuppressionMode: NoiseSuppressionMode;
  noiseSuppressionLevel: NoiseSuppressionLevel;
  // Pitch shift
  isPitchShiftEnabled: boolean;
  pitchFactor: number;
  // Chat
  isChatDisplayed: boolean;
  // Whiteboard
  isWhiteboardDisplayed: boolean;
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
  isNoiseSuppressionEnabled: false,
  noiseSuppressionMode: "NSNG",
  noiseSuppressionLevel: "SOFT",
  isPitchShiftEnabled: false,
  pitchFactor: 1.0,
  isChatDisplayed: false,
  isWhiteboardDisplayed: false,
};

const rtcSlice = createSlice({
  name: "rtc",
  initialState,
  reducers: {
    setLocalCameraTrack: (
      state,
      { payload }: PayloadAction<ICameraVideoTrack | null>,
    ) => {
      state.localCameraTrack = payload;
    },
    setLocalMicrophoneTrack: (
      state,
      { payload }: PayloadAction<ILocalAudioTrack | null>,
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
    setIsNoiseSuppressionEnabled: (
      state,
      { payload }: PayloadAction<boolean>,
    ) => {
      state.isNoiseSuppressionEnabled = payload;
    },
    setNoiseSuppressionMode: (
      state,
      { payload }: PayloadAction<NoiseSuppressionMode>,
    ) => {
      state.noiseSuppressionMode = payload;
    },
    setNoiseSuppressionLevel: (
      state,
      { payload }: PayloadAction<NoiseSuppressionLevel>,
    ) => {
      state.noiseSuppressionLevel = payload;
    },
    setIsPitchShiftEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.isPitchShiftEnabled = payload;
    },
    setPitchFactor: (state, { payload }: PayloadAction<number>) => {
      state.pitchFactor = payload;
    },
    setIsChatDisplayed: (state, { payload }: PayloadAction<boolean>) => {
      state.isChatDisplayed = payload;
    },
    setIsWhiteboardDisplayed: (state, { payload }: PayloadAction<boolean>) => {
      state.isWhiteboardDisplayed = payload;
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
  setIsNoiseSuppressionEnabled,
  setNoiseSuppressionMode,
  setNoiseSuppressionLevel,
  setIsPitchShiftEnabled,
  setPitchFactor,
  setIsChatDisplayed,
  setIsWhiteboardDisplayed,
} = rtcSlice.actions;
export default rtcSlice.reducer;
