import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Heart, Settings, Trash2 } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CocoonSettingsModal } from '@/components/CocoonSettingsModal';

export function ListView() {
  const navigate = useNavigate();
  const { cocoons, deleteCocoon, isDarkMode } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [swipedCocoonId, setSwipedCocoonId] = useState<string | null>(null);
  const [editingCocoonId, setEditingCocoonId] = useState<string | null>(null);

  const filteredCocoons = cocoons.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen relative">
      <div className="flex items-center justify-between p-6 pt-safe relative z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 opacity-70 hover:opacity-100 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        </div>
        <button className="p-2 -mr-2 opacity-70 hover:opacity-100 transition-opacity">
          <Search size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 relative z-10 hide-scrollbar">
        {/* Special items */}
        <div className={cn(
          "flex items-center justify-between p-5 rounded-3xl backdrop-blur-xl border shadow-lg transition-all",
          isDarkMode 
            ? "bg-white/5 border-white/10 shadow-black/20" 
            : "bg-white/40 border-white/60 shadow-black/5"
        )}>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">History</h3>
            <p className="text-sm opacity-60 font-medium">Read and search all your entries</p>
          </div>
          <Heart size={22} className="opacity-40" />
        </div>

        <div className={cn(
          "flex items-center justify-between p-5 rounded-3xl backdrop-blur-xl border shadow-lg transition-all",
          isDarkMode 
            ? "bg-white/5 border-white/10 shadow-black/20" 
            : "bg-white/40 border-white/60 shadow-black/5"
        )}>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Inbox</h3>
            <p className="text-sm opacity-60 font-medium">All thoughts without a category</p>
          </div>
          <Heart size={22} className="opacity-40" />
        </div>

        {/* User Cocoons */}
        <AnimatePresence>
          {filteredCocoons.map((cocoon) => (
            <motion.div
              key={cocoon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="relative rounded-3xl overflow-hidden"
            >
              {/* Background Actions (Revealed on swipe) */}
              <div className="absolute inset-0 flex justify-end items-center px-5 gap-3 bg-black/5 dark:bg-white/5 backdrop-blur-md">
                <button 
                  onClick={() => setEditingCocoonId(cocoon.id)}
                  className="p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 hover:scale-110 transition-transform"
                >
                  <Settings size={22} />
                </button>
                <button 
                  onClick={() => deleteCocoon(cocoon.id)}
                  className="p-3 rounded-full bg-red-500/80 backdrop-blur-md border border-red-400/50 text-white hover:scale-110 transition-transform"
                >
                  <Trash2 size={22} />
                </button>
              </div>

              {/* Foreground Item (Liquid Glass) */}
              <motion.div
                drag="x"
                dragConstraints={{ left: -140, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -60) {
                    setSwipedCocoonId(cocoon.id);
                  } else {
                    setSwipedCocoonId(null);
                  }
                }}
                animate={{ x: swipedCocoonId === cocoon.id ? -140 : 0 }}
                onClick={() => {
                  if (swipedCocoonId === cocoon.id) {
                    setSwipedCocoonId(null);
                  } else {
                    navigate(`/cocoon/${cocoon.id}`);
                  }
                }}
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl cursor-pointer relative z-10 backdrop-blur-xl border shadow-lg transition-colors",
                  isDarkMode 
                    ? "bg-slate-800/40 border-slate-700/50 shadow-black/20 hover:bg-slate-700/40" 
                    : "bg-white/60 border-slate-200 shadow-sm hover:bg-white/80"
                )}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full shadow-inner" 
                    style={{ backgroundColor: cocoon.color, boxShadow: `0 0 10px ${cocoon.color}80` }} 
                  />
                  <h3 className="font-semibold text-lg tracking-tight">{cocoon.name}</h3>
                </div>
                <Heart 
                  size={22} 
                  className={cn("transition-opacity", cocoon.isVisibleOnHome ? "opacity-100 text-red-500" : "opacity-30")} 
                  fill={cocoon.isVisibleOnHome ? "currentColor" : "none"}
                />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={() => navigate('/create')}
          className={cn(
            "w-full flex items-center justify-center gap-2 p-5 rounded-3xl backdrop-blur-xl border shadow-lg transition-all font-semibold text-lg mt-4",
            isDarkMode 
              ? "bg-slate-800/40 border-slate-700/50 shadow-black/20 hover:bg-slate-700/40" 
              : "bg-white/60 border-slate-200 shadow-sm hover:bg-white/80"
          )}
        >
          + Create New Category
        </button>
      </div>

      {editingCocoonId && (
        <CocoonSettingsModal 
          cocoonId={editingCocoonId} 
          onClose={() => setEditingCocoonId(null)} 
        />
      )}
    </div>
  );
}
