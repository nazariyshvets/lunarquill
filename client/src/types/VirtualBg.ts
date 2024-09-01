type VirtualBgType = "blur" | "color" | "img" | "video";

type VirtualBgBlurDegree = 1 | 2 | 3;
type VirtualBgBlurDegreeString = `${VirtualBgBlurDegree}`;

interface VirtualBgMediaSource {
  id: string;
  source: File;
}

export type {
  VirtualBgBlurDegree,
  VirtualBgBlurDegreeString,
  VirtualBgMediaSource,
  VirtualBgType,
};
