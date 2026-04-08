import { pipeline, env } from '@xenova/transformers';

// Disable local models, fetch from Hugging Face
env.allowLocalModels = false;

let transcriber: any = null;
let currentModel = '';

self.onmessage = async (e) => {
  const { type, audio, model } = e.data;

  if (type === 'load') {
    if (transcriber && currentModel === model) {
      self.postMessage({ status: 'ready' });
      return;
    }
    
    self.postMessage({ status: 'loading' });
    try {
      transcriber = await pipeline('automatic-speech-recognition', model, {
        progress_callback: (progressInfo: any) => {
          self.postMessage({ status: 'progress', progress: progressInfo });
        }
      });
      currentModel = model;
      self.postMessage({ status: 'ready' });
    } catch (err: any) {
      self.postMessage({ status: 'error', error: err.message });
    }
  } else if (type === 'transcribe') {
    if (!transcriber) {
      self.postMessage({ status: 'error', error: 'Model not loaded' });
      return;
    }
    self.postMessage({ status: 'transcribing' });
    try {
      const result = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: 'english',
        task: 'transcribe',
      });
      self.postMessage({ status: 'complete', text: result.text });
    } catch (err: any) {
      self.postMessage({ status: 'error', error: err.message });
    }
  }
};
