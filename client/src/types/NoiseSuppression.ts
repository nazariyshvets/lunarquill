import {
  AIDenoiserProcessorMode,
  AIDenoiserProcessorLevel,
} from "agora-extension-ai-denoiser";

type NoiseSuppressionMode = keyof typeof AIDenoiserProcessorMode;
type NoiseSuppressionLevel = keyof typeof AIDenoiserProcessorLevel;

export type { NoiseSuppressionMode, NoiseSuppressionLevel };
