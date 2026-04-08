import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  '#facc15', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f97316', '#06b6d4'
];

export function CreateCocoon() {
  const navigate = useNavigate();
  const addCocoon = useStore((state) => state.addCocoon);
  const isDarkMode = useStore((state) => state.isDarkMode);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleNext = () => {
    if (name.trim()) setStep(2);
  };

  const handleCreate = () => {
    addCocoon({
      name: name.trim(),
      color,
      x: window.innerWidth / 2 - 50,
      y: window.innerHeight / 2 - 50,
      size: Math.max(80, Math.min(120, name.length * 10 + 40)) // Dynamic size based on name length
    });
    navigate('/');
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col",
      isDarkMode ? "bg-black text-white" : "bg-[#faf9f7] text-black"
    )}>
      <div className="flex items-center justify-between p-6">
        <span className="text-sm font-medium opacity-50">Step {step} of 2</span>
        <button onClick={() => navigate('/')} className="p-2 -mr-2 opacity-50 hover:opacity-100">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <p className="text-sm opacity-50 mb-8">One word, no special characters</p>
              <h2 className="text-2xl font-medium mb-8">So, what's my name?</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={cn(
                  "w-full text-center text-4xl font-medium bg-transparent border-none outline-none placeholder:opacity-20",
                  isDarkMode ? "text-white" : "text-black"
                )}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="mt-16 text-lg font-medium opacity-50 hover:opacity-100 disabled:opacity-20 transition-opacity"
              >
                Next
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-medium mb-12">What color do you associate with?</h2>
              
              <div className="flex gap-4 overflow-x-auto w-full px-6 pb-8 snap-x snap-mandatory hide-scrollbar justify-center">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "shrink-0 w-24 h-24 rounded-full snap-center transition-transform",
                      color === c ? "scale-110 shadow-lg" : "scale-90 opacity-50 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                onClick={handleCreate}
                className="mt-8 text-lg font-medium opacity-50 hover:opacity-100 transition-opacity"
              >
                Create
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
