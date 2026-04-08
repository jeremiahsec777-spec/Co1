import { Heart, Layers, Compass, Settings, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

export function BottomNav() {
  const location = useLocation();
  const isDarkMode = useStore((state) => state.isDarkMode);

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-safe z-50">
      <div className={cn(
        "flex items-center justify-between px-8 py-4 backdrop-blur-md",
        isDarkMode ? "bg-[#1c1c1e]/80 text-white" : "bg-[#faf9f7]/80 text-black"
      )}>
        <Link to="/favorites" className="opacity-50 hover:opacity-100 transition-opacity">
          <Heart size={24} />
        </Link>
        <Link to="/list" className="opacity-50 hover:opacity-100 transition-opacity">
          <Layers size={24} />
        </Link>
        
        <div className="w-16" /> {/* Spacer for central button */}

        <Link to="/map" className="opacity-50 hover:opacity-100 transition-opacity">
          <Compass size={24} />
        </Link>
        <Link to="/settings" className="opacity-50 hover:opacity-100 transition-opacity">
          <Settings size={24} />
        </Link>

        {/* Central Logo Button */}
        <Link to="/record" className="absolute left-1/2 -translate-x-1/2 -top-6">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95",
            isDarkMode ? "bg-[#2c2c2e] shadow-black/50" : "bg-white shadow-black/10"
          )}>
            <svg viewBox="0 0 100 100" className="w-10 h-10 opacity-80">
              <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="url(#grad1)" strokeWidth="2" />
              <path d="M50 15 C25 35, 15 60, 50 85 C85 60, 75 35, 50 15 Z" fill="none" stroke="url(#grad1)" strokeWidth="1.5" />
              <path d="M50 20 C30 40, 20 60, 50 80 C80 60, 70 40, 50 20 Z" fill="none" stroke="url(#grad1)" strokeWidth="1" />
              <path d="M50 25 C35 45, 25 60, 50 75 C75 60, 65 45, 50 25 Z" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
