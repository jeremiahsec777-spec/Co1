import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, whisperModel, setWhisperModel } = useStore();
  
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkCache = async (model: string) => {
    try {
      const cache = await caches.open('transformers-cache');
      const keys = await cache.keys();
      // Check if any cached file URL contains the model name
      const cached = keys.some(req => req.url.includes(model));
      setIsCached(cached);
    } catch (err) {
      console.error('Cache check failed:', err);
    }
  };

  useEffect(() => {
    checkCache(whisperModel);
  }, [whisperModel]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const downloadModel = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    workerRef.current = new Worker(new URL('../lib/whisper.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { status, progress } = e.data;
      if (status === 'progress' && progress?.progress) {
        setDownloadProgress(progress.progress);
      } else if (status === 'ready') {
        setIsDownloading(false);
        setDownloadProgress(null);
        setIsCached(true);
        workerRef.current?.terminate();
      } else if (status === 'error') {
        setIsDownloading(false);
        setDownloadProgress(null);
        alert('Failed to download model.');
        workerRef.current?.terminate();
      }
    };

    workerRef.current.postMessage({ type: 'load', model: whisperModel });
  };

  const handleImportModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const cache = await caches.open('transformers-cache');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // webkitRelativePath is like "whisper-tiny/onnx/model.onnx"
        // We need to strip the top-level directory name
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          parts.shift(); // remove top-level dir
        }
        const relativePath = parts.join('/') || file.name;

        const url = `https://huggingface.co/${whisperModel}/resolve/main/${relativePath}`;
        const response = new Response(file, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'Content-Length': file.size.toString(),
          }
        });
        await cache.put(url, response);
      }
      setIsCached(true);
      alert('Model imported successfully to cache!');
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import model.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-2 p-4 pt-safe border-b border-black/5 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 opacity-70 hover:opacity-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-medium">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wider">Visuals</h2>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5">
            <div>
              <p className="font-medium">Eclipse Mode</p>
              <p className="text-sm opacity-70">Toggle dark appearance</p>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                isDarkMode ? "bg-purple-500" : "bg-black/20"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                isDarkMode ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wider">Transcription</h2>
          
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
            <div>
              <p className="font-medium">Offline Whisper Model</p>
              <p className="text-sm opacity-70">Select the model size for offline transcription. Larger models are more accurate but take longer to load and process.</p>
            </div>
            
            <select 
              value={whisperModel}
              onChange={(e) => setWhisperModel(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 outline-none font-medium"
            >
              <option value="Xenova/whisper-tiny">Tiny (Fastest, ~40MB)</option>
              <option value="Xenova/whisper-base">Base (Fast, ~75MB)</option>
              <option value="Xenova/whisper-small">Small (Balanced, ~250MB)</option>
              <option value="Xenova/whisper-medium">Medium (Accurate, ~750MB)</option>
            </select>

            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
              {isCached ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium p-2">
                  <CheckCircle2 size={20} />
                  <span>Model is downloaded and ready for offline use</span>
                </div>
              ) : (
                <button 
                  onClick={downloadModel}
                  disabled={isDownloading}
                  className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Downloading... {downloadProgress ? `${Math.round(downloadProgress)}%` : ''}
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Model
                    </>
                  )}
                </button>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/10 text-black dark:text-white font-medium flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                <Upload size={20} />
                Import Model Folder
              </button>
              {/* @ts-ignore - webkitdirectory is non-standard but widely supported */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportModel} 
                className="hidden" 
                webkitdirectory="true" 
                directory="true" 
                multiple 
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wider">About</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <span className="font-medium">About CocoonWeaver</span>
              <ChevronLeft size={20} className="rotate-180 opacity-50" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <span className="font-medium">Siri Shortcut</span>
              <ChevronLeft size={20} className="rotate-180 opacity-50" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
