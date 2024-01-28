import { AIDenoiserProcessorLevel } from "agora-extension-ai-denoiser";

type NoiseSuppressionLevel = keyof typeof AIDenoiserProcessorLevel;

export default NoiseSuppressionLevel;
