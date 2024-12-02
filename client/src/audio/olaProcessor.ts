const WEBAUDIO_BLOCK_SIZE = 128;

/** Overlap-Add Node */
class OLAProcessor extends AudioWorkletProcessor {
  nbInputs: number;
  nbOutputs: number;
  blockSize: number;
  hopSize: number;
  nbOverlaps: number;
  inputBuffers: Float32Array[][];
  inputBuffersHead: Float32Array[][];
  inputBuffersToSend: Float32Array[][];
  outputBuffers: Float32Array[][];
  outputBuffersToRetrieve: Float32Array[][];

  constructor(options: AudioWorkletNodeOptions) {
    super();

    // Initialize properties
    this.nbInputs = options.numberOfInputs ?? 1;
    this.nbOutputs = options.numberOfOutputs ?? 1;
    this.blockSize = options.processorOptions.blockSize;
    this.hopSize = WEBAUDIO_BLOCK_SIZE;
    this.nbOverlaps = this.blockSize / this.hopSize;

    // pre-allocate input buffers (will be reallocated if needed)
    this.inputBuffers = new Array(this.nbInputs);
    this.inputBuffersHead = new Array(this.nbInputs);
    this.inputBuffersToSend = new Array(this.nbInputs);

    // default to 1 channel per input until we know more
    for (let i = 0; i < this.nbInputs; i++) {
      this.allocateInputChannels(i, 1);
    }

    // pre-allocate output buffers (will be reallocated if needed)
    this.outputBuffers = new Array(this.nbOutputs);
    this.outputBuffersToRetrieve = new Array(this.nbOutputs);

    // default to 1 channel per output until we know more
    for (let i = 0; i < this.nbOutputs; i++) {
      this.allocateOutputChannels(i, 1);
    }
  }

  /** Handles dynamic reallocation of input/output channels buffer (channel numbers may vary during lifecycle) */
  reallocateChannelsIfNeeded(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
  ) {
    for (let i = 0; i < this.nbInputs; i++) {
      const nbChannels = inputs[i].length;

      if (nbChannels !== this.inputBuffers[i].length) {
        this.allocateInputChannels(i, nbChannels);
      }
    }

    for (let i = 0; i < this.nbOutputs; i++) {
      const nbChannels = outputs[i].length;

      if (nbChannels !== this.outputBuffers[i].length) {
        this.allocateOutputChannels(i, nbChannels);
      }
    }
  }

  allocateInputChannels(inputIndex: number, nbChannels: number) {
    // allocate input buffers
    this.inputBuffers[inputIndex] = new Array(nbChannels);

    for (let i = 0; i < nbChannels; i++) {
      this.inputBuffers[inputIndex][i] = new Float32Array(
        this.blockSize + WEBAUDIO_BLOCK_SIZE,
      );
      this.inputBuffers[inputIndex][i].fill(0);
    }

    // allocate input buffers to send and head pointers to copy from
    // (cannot directly send a pointer/subarray because input may be modified)
    this.inputBuffersHead[inputIndex] = new Array(nbChannels);
    this.inputBuffersToSend[inputIndex] = new Array(nbChannels);

    for (let i = 0; i < nbChannels; i++) {
      this.inputBuffersHead[inputIndex][i] = this.inputBuffers[inputIndex][
        i
      ].subarray(0, this.blockSize);
      this.inputBuffersToSend[inputIndex][i] = new Float32Array(this.blockSize);
    }
  }

  allocateOutputChannels(outputIndex: number, nbChannels: number) {
    // allocate output buffers
    this.outputBuffers[outputIndex] = new Array(nbChannels);

    for (let i = 0; i < nbChannels; i++) {
      this.outputBuffers[outputIndex][i] = new Float32Array(this.blockSize);
      this.outputBuffers[outputIndex][i].fill(0);
    }

    // allocate output buffers to retrieve
    // (cannot send a pointer/subarray because new output has to be added to existing output)
    this.outputBuffersToRetrieve[outputIndex] = new Array(nbChannels);

    for (let i = 0; i < nbChannels; i++) {
      this.outputBuffersToRetrieve[outputIndex][i] = new Float32Array(
        this.blockSize,
      );
      this.outputBuffersToRetrieve[outputIndex][i].fill(0);
    }
  }

  /** Read next web audio block to input buffers */
  readInputs(inputs: Float32Array[][]) {
    // when playback is paused, we may stop receiving new samples
    if (!!inputs[0].length && inputs[0][0].length === 0) {
      for (let i = 0; i < this.nbInputs; i++) {
        for (let j = 0; j < this.inputBuffers[i].length; j++) {
          this.inputBuffers[i][j].fill(0, this.blockSize);
        }
      }
      return;
    }

    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffers[i][j].set(inputs[i][j], this.blockSize);
      }
    }
  }

  /** Write next web audio block from output buffers */
  writeOutputs(outputs: Float32Array[][]) {
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        const webAudioBlock = this.outputBuffers[i][j].subarray(
          0,
          WEBAUDIO_BLOCK_SIZE,
        );
        outputs[i][j].set(webAudioBlock, 0);
      }
    }
  }

  /** Shift left content of input buffers to receive new web audio block */
  shiftInputBuffers() {
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffers[i][j].copyWithin(0, WEBAUDIO_BLOCK_SIZE);
      }
    }
  }

  /** Shift left content of output buffers to receive new web audio block */
  shiftOutputBuffers() {
    for (let i = 0; i < this.nbOutputs; i++) {
      for (let j = 0; j < this.outputBuffers[i].length; j++) {
        this.outputBuffers[i][j].copyWithin(0, WEBAUDIO_BLOCK_SIZE);
        this.outputBuffers[i][j]
          .subarray(this.blockSize - WEBAUDIO_BLOCK_SIZE)
          .fill(0);
      }
    }
  }

  /** Copy contents of input buffers to buffer actually sent to process */
  prepareInputBuffersToSend() {
    for (let i = 0; i < this.nbInputs; i++) {
      for (let j = 0; j < this.inputBuffers[i].length; j++) {
        this.inputBuffersToSend[i][j].set(this.inputBuffersHead[i][j]);
      }
    }
  }

  /** Add contents of output buffers just processed to output buffers */
  handleOutputBuffersToRetrieve() {
    for (let i = 0; i < this.nbOutputs; i++) {
      for (let j = 0; j < this.outputBuffers[i].length; j++) {
        for (let k = 0; k < this.blockSize; k++) {
          this.outputBuffers[i][j][k] +=
            this.outputBuffersToRetrieve[i][j][k] / this.nbOverlaps;
        }
      }
    }
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<string, Float32Array>,
  ): boolean {
    this.reallocateChannelsIfNeeded(inputs, outputs);

    this.readInputs(inputs);
    this.shiftInputBuffers();
    this.prepareInputBuffersToSend();
    this.processOLA(
      this.inputBuffersToSend,
      this.outputBuffersToRetrieve,
      params,
    );
    this.handleOutputBuffersToRetrieve();
    this.writeOutputs(outputs);
    this.shiftOutputBuffers();

    return true;
  }

  processOLA(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputs: Float32Array[][],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    outputs: Float32Array[][],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: Record<string, Float32Array>,
  ): void {
    console.assert(false, "Not overridden");
  }
}

export { OLAProcessor };
