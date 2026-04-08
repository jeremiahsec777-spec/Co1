import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, whisperModel, setWhisperModel } = useStore();

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
          
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
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
