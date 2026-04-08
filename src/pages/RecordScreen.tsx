import React from "react";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mic, Check, ChevronDown, Loader2, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeAudio } from '@/lib/audioUtils';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function RecordScreen() {
  const navigate = useNavigate();
  const { cocoons, isDarkMode, addNote, whisperModel } = useStore();
  const [selectedCocoonId, setSelectedCocoonId] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'transcribing' | 'finished'>('idle');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Worker and Audio state
  const workerRef = useRef<Worker | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState<any>(null);

  // Initialize Worker and load model
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/whisper.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { status, text, progress: prog, error } = e.data;
      if (status === 'loading') setModelStatus('loading');
      if (status === 'progress') setProgress(prog);
      if (status === 'ready') setModelStatus('ready');
      if (status === 'error') {
        setModelStatus('error');
        console.error('Whisper Error:', error);
      }
      if (status === 'transcribing') setRecordingState('transcribing');
      if (status === 'complete') {
        setTranscribedText(text);
        setRecordingState('finished');
      }
    };

    workerRef.current.postMessage({ type: 'load', model: whisperModel });

    return () => {
      workerRef.current?.terminate();
    };
  }, [whisperModel]);

  // Default to first cocoon if none selected
  useEffect(() => {
    if (!selectedCocoonId && cocoons.length > 0) {
      setSelectedCocoonId(cocoons[0].id);
    }
  }, [cocoons, selectedCocoonId]);

  const selectedCocoon = cocoons.find(c => c.id === selectedCocoonId);
  const bgColor = selectedCocoon ? selectedCocoon.color : (isDarkMode ? '#1c1c1e' : '#faf9f7');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await blobToBase64(file);
        setImageBase64(base64);
      } catch (err) {
        console.error("Failed to read image", err);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Capture location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.warn('Location access denied or failed:', err)
        );
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        setRecordingState('transcribing');
        try {
          const base64 = await blobToBase64(audioBlob);
          setAudioBase64(base64);
          
          const audioData = await decodeAudio(audioBlob);
          workerRef.current?.postMessage({ type: 'transcribe', audio: audioData });
        } catch (err) {
          console.error('Audio processing error:', err);
          setRecordingState('finished');
          setTranscribedText("Error processing audio.");
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setTranscribedText('');
      setAudioBase64(undefined);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone access to record notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFinish = () => {
    if (selectedCocoonId && transcribedText) {
      addNote({
        cocoonId: selectedCocoonId,
        text: transcribedText,
        type: 'audio',
        audioBase64,
        imageBase64,
        location,
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
              <p className="opacity-80 text-lg font-medium mb-8">
                allocates my note to the category "{selectedCocoon?.name || 'Name'}".
              </p>
              
              {modelStatus === 'loading' && (
                <div className="flex flex-col items-center gap-2 opacity-70">
                  <Loader2 size={24} className="animate-spin" />
                  <p className="text-sm font-medium">
                    Loading offline model... 
                    {progress?.progress ? ` ${Math.round(progress.progress)}%` : ''}
                  </p>
                </div>
              )}
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
          {recordingState === 'transcribing' && (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 size={32} className="animate-spin" />
              <span className="text-2xl font-semibold tracking-tight">Transcribing...</span>
            </motion.div>
          )}
          {recordingState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-lg">
                <p className="text-xl font-medium leading-relaxed text-left">
                  {transcribedText || "No speech detected."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Logo Placeholder */}
        {recordingState !== 'finished' && (
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
        )}
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
            
            <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-16 h-16 rounded-full backdrop-blur-md border flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg",
                  imageBase64 ? "bg-white/40 border-white/50" : "bg-white/20 border-white/30"
                )}
              >
                <ImageIcon size={28} className="text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </button>

              <button 
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-white">
                  <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </button>
            </div>

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
              onClick={() => {
                if (recordingState === 'recording') {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              disabled={modelStatus !== 'ready' && recordingState === 'idle'}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl border",
                recordingState === 'recording' 
                  ? "bg-white/20 backdrop-blur-md border-white/30" 
                  : "bg-white text-black border-transparent hover:scale-105",
                (modelStatus !== 'ready' && recordingState === 'idle') && "opacity-50 cursor-not-allowed"
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
