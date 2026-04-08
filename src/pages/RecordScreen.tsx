import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, Check, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function RecordScreen() {
  const navigate = useNavigate();
  const { cocoons, isDarkMode, addNote } = useStore();
  const [selectedCocoonId, setSelectedCocoonId] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Default to first cocoon if none selected
  useEffect(() => {
    if (!selectedCocoonId && cocoons.length > 0) {
      setSelectedCocoonId(cocoons[0].id);
    }
  }, [cocoons, selectedCocoonId]);

  const selectedCocoon = cocoons.find(c => c.id === selectedCocoonId);
  const bgColor = selectedCocoon ? selectedCocoon.color : (isDarkMode ? '#1c1c1e' : '#faf9f7');

  const handleFinish = () => {
    if (selectedCocoonId) {
      addNote({
        cocoonId: selectedCocoonId,
        text: "This is a transcribed audio note.",
        type: 'audio'
      });
    }
    navigate(-1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col transition-colors duration-500"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header with Custom Liquid Glass Dropdown */}
      <div className="flex items-center justify-between p-6 pt-safe text-white relative z-20">
        <div className="w-8" /> {/* Spacer */}
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition-all font-semibold text-lg"
          >
            {selectedCocoon?.name || 'Select Cocoon'}
            <ChevronDown size={20} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 max-h-64 overflow-y-auto rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hide-scrollbar"
              >
                <div className="p-2 flex flex-col gap-1">
                  {cocoons.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCocoonId(c.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-2xl font-medium transition-colors flex items-center gap-3",
                        selectedCocoonId === c.id ? "bg-white/20" : "hover:bg-white/10"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => navigate(-1)} className="p-2 -mr-2 opacity-70 hover:opacity-100 transition-opacity">
          <X size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white text-center relative z-10">
        <AnimatePresence mode="wait">
          {recordingState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-xs"
            >
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Saying "Cocoon, {selectedCocoon?.name || 'Name'}"
              </h2>
              <p className="opacity-80 text-lg font-medium">
                allocates my note to the category "{selectedCocoon?.name || 'Name'}".
              </p>
            </motion.div>
          )}
          {recordingState === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-semibold tracking-tight"
            >
              Listening...
            </motion.div>
          )}
          {recordingState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-semibold tracking-tight"
            >
              Note recorded.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Logo Placeholder */}
        <div className="my-16 relative w-64 h-64 flex items-center justify-center">
          <motion.svg 
            viewBox="0 0 100 100" 
            className="w-full h-full opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            animate={{ 
              rotate: recordingState === 'recording' ? 360 : 0,
              scale: recordingState === 'recording' ? [1, 1.05, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />
            <path d="M50 15 C25 35, 15 60, 50 85 C85 60, 75 35, 50 15 Z" fill="none" stroke="white" strokeWidth="1" opacity="0.7" />
            <path d="M50 20 C30 40, 20 60, 50 80 C80 60, 70 40, 50 20 Z" fill="none" stroke="white" strokeWidth="0.8" opacity="0.5" />
            <path d="M50 25 C35 45, 25 60, 50 75 C75 60, 65 45, 50 25 Z" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </motion.svg>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-safe flex items-center justify-between text-white h-32 relative z-10">
        {recordingState === 'finished' ? (
          <>
            <button 
              onClick={() => setRecordingState('idle')}
              className="opacity-70 hover:opacity-100 font-semibold text-lg transition-opacity"
            >
              Delete
            </button>
            
            <button 
              onClick={() => setRecordingState('recording')}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-white">
                <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </button>

            <button 
              onClick={handleFinish}
              className="flex items-center gap-2 opacity-70 hover:opacity-100 font-semibold text-lg transition-opacity"
            >
              <Check size={24} strokeWidth={2.5} /> Finish
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button 
              onClick={() => setRecordingState(recordingState === 'recording' ? 'finished' : 'recording')}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl border",
                recordingState === 'recording' 
                  ? "bg-white/20 backdrop-blur-md border-white/30" 
                  : "bg-white text-black border-transparent hover:scale-105"
              )}
            >
              {recordingState === 'recording' ? (
                <div className="w-6 h-6 bg-white rounded-sm" /> // Stop icon
              ) : (
                <Mic size={32} className="text-current" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="absolute inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)} 
        />
      )}
    </div>
  );
}
