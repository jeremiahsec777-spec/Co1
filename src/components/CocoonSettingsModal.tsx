import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Heart, Lightbulb, ShoppingBag, Pin, Book, HelpCircle } from 'lucide-react';

const COLORS = [
  '#854d0e', '#c02626', '#0056b3', '#991b1b', '#1e3a8a', '#10b981', '#8b5cf6', '#f43f5e'
];

const ICONS = [
  { name: 'Heart', icon: Heart },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Pin', icon: Pin },
  { name: 'Book', icon: Book },
  { name: 'HelpCircle', icon: HelpCircle },
];

export function CocoonSettingsModal({ cocoonId, onClose }: { cocoonId: string, onClose: () => void }) {
  const { cocoons, updateCocoon, isDarkMode } = useStore();
  const cocoon = cocoons.find(c => c.id === cocoonId);

  if (!cocoon) return null;

  const [name, setName] = useState(cocoon.name);
  const [color, setColor] = useState(cocoon.color);
  const [icon, setIcon] = useState(cocoon.icon || 'HelpCircle');
  const [isVisible, setIsVisible] = useState(cocoon.isVisibleOnHome !== false);

  const handleSave = () => {
    updateCocoon(cocoonId, { name, color, icon, isVisibleOnHome: isVisible });
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
            <span className="font-medium">Edit Category</span>
            <button onClick={handleSave} className="font-medium text-blue-500">Save</button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "shrink-0 w-10 h-10 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "opacity-60 scale-90"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
              {ICONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setIcon(item.name)}
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      icon === item.name 
                        ? isDarkMode ? "bg-white/20 ring-2 ring-white/40" : "bg-black/10 ring-2 ring-black/20" 
                        : "opacity-40"
                    )}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
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
              <p className="text-xs opacity-50 mt-1">Cocoon Name</p>
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
