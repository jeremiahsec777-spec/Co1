import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

const COLORS = [
  '#facc15', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f97316', '#06b6d4'
];

export function CocoonSettingsModal({ cocoonId, onClose }: { cocoonId: string, onClose: () => void }) {
  const { cocoons, updateCocoon, isDarkMode } = useStore();
  const cocoon = cocoons.find(c => c.id === cocoonId);

  if (!cocoon) return null;

  const [name, setName] = useState(cocoon.name);
  const [color, setColor] = useState(cocoon.color);
  const [isVisible, setIsVisible] = useState(cocoon.isVisibleOnHome !== false);

  const handleSave = () => {
    updateCocoon(cocoonId, { name, color, isVisibleOnHome: isVisible });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={cn(
            "w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-6",
            isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-white text-black"
          )}
        >
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="opacity-50 hover:opacity-100">Cancel</button>
            <span className="font-medium">Edit Cocoon</span>
            <button onClick={handleSave} className="font-medium text-blue-500">Save</button>
          </div>

          <div className="flex gap-4 overflow-x-auto py-4 snap-x snap-mandatory hide-scrollbar">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "shrink-0 w-16 h-16 rounded-full snap-center transition-transform",
                  color === c ? "scale-110 shadow-lg border-2 border-white" : "scale-90 opacity-50"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="border-b border-black/10 dark:border-white/10 pb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-xl font-medium outline-none"
                placeholder="Cocoon Name"
              />
              <p className="text-xs opacity-50 mt-1">Cocoon Name (One word)</p>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium">Visible on Home ❤️</span>
              <button 
                onClick={() => setIsVisible(!isVisible)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  isVisible ? "bg-green-500" : "bg-black/20 dark:bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  isVisible ? "left-7" : "left-1"
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2 opacity-50">
              <span className="font-medium">Push Notifications</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
