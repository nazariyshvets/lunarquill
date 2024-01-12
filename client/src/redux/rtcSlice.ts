import { createSlice } from "@reduxjs/toolkit";
import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";

export interface RTCState {
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
}

const initialState: RTCState = {
  localCameraTrack: null,
  localMicrophoneTrack: null,
};

const rtcSlice = createSlice({
  name: "rtc",
  initialState,
  reducers: {
    setLocalTracks: (state, { payload }) => {
      state.localCameraTrack = payload.localCameraTrack;
      state.localMicrophoneTrack = payload.localMicrophoneTrack;
    },
  },
});

export const { setLocalTracks } = rtcSlice.actions;
export default rtcSlice.reducer;
