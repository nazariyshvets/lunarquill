import { AIDenoiserProcessorMode } from "agora-extension-ai-denoiser";

type NoiseSuppressionMode = keyof typeof AIDenoiserProcessorMode;

export default NoiseSuppressionMode;
