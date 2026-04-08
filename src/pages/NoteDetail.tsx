import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Play, Pause } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';

export function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, cocoons, isDarkMode } = useStore();
  
  const note = notes.find(n => n.id === id);
  const cocoon = cocoons.find(c => c.id === note?.cocoonId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (note?.audioBase64) {
      audioRef.current = new Audio(note.audioBase64);
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [note?.audioBase64]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!note || !cocoon) return null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1c1c1e]">
      <div className="flex items-center justify-between p-4 pt-safe">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 opacity-70 hover:opacity-100">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-medium opacity-50">Note</h1>
        </div>
        <button className="p-2 -mr-2 opacity-70 hover:opacity-100">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center pb-32">
        <h2 className="text-2xl font-medium text-center mb-6 leading-tight">
          {note.text.split('.')[0] + '.'}
        </h2>
        
        <div className="px-4 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium opacity-70 mb-8">
          {format(note.createdAt, 'EEEE, MMM do')}
        </div>

        {note.type === 'audio' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6 text-sm font-medium self-start" style={{ color: cocoon.color }}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Playing 1st thought' : '1st thought'}</span>
            </div>

            <p className="text-lg leading-relaxed text-left w-full mb-2">
              {note.text}
            </p>
            <p className="text-xs opacity-50 text-left w-full mb-8">
              {format(note.createdAt, 'HH:mm')}
            </p>

            {note.imageBase64 && (
              <div className="w-full aspect-square rounded-3xl overflow-hidden mb-8 shadow-lg">
                <img src={note.imageBase64} alt="Note attachment" className="w-full h-full object-cover" />
              </div>
            )}

            <button className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-12 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              <span className="text-2xl font-light">+</span>
            </button>
          </div>
        )}
      </div>

      {note.type === 'audio' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs opacity-50 font-medium w-8">0:00</span>
              <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden relative cursor-pointer">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress}%`, backgroundColor: cocoon.color }}
                />
              </div>
              <span className="text-xs opacity-50 font-medium w-8 text-right">0:09</span>
            </div>

            <div className="flex items-center justify-center gap-12">
              <button className="opacity-50 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
              <button 
                onClick={togglePlay}
                className="opacity-80 hover:opacity-100 transition-transform hover:scale-105 active:scale-95"
                style={{ color: cocoon.color }}
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
              <button className="opacity-50 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
