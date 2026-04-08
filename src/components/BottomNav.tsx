import { Home, Layers, Compass, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

export function BottomNav() {
  const location = useLocation();
  const isDarkMode = useStore((state) => state.isDarkMode);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/list', icon: Layers, label: 'List' },
    { path: '/map', icon: Compass, label: 'Map' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Link 
        key={item.path}
        to={item.path} 
        className={cn(
          "flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-[1.5rem] transition-all duration-300",
          isActive 
            ? isDarkMode ? "bg-white/10" : "bg-black/5" 
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}
      >
        <Icon 
          size={22} 
          className={cn(
            "mb-1 transition-colors duration-300",
            isActive 
              ? isDarkMode ? "text-white" : "text-black"
              : isDarkMode ? "text-white/50" : "text-black/50"
          )}
          fill={isActive ? "currentColor" : "none"}
          strokeWidth={isActive ? 2 : 1.5}
        />
        <span className={cn(
          "text-[10px] font-medium transition-colors duration-300",
          isActive 
            ? isDarkMode ? "text-white" : "text-black"
            : isDarkMode ? "text-white/50" : "text-black/50"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 flex items-center justify-center z-50 pointer-events-none">
      {/* Main Navigation Pill */}
      <div className={cn(
        "flex items-center justify-between p-1.5 rounded-[2rem] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto w-full max-w-[380px] transition-colors duration-300 relative",
        isDarkMode 
          ? "bg-[#1c1c1e]/50 border border-white/10" 
          : "bg-white/50 border border-black/5"
      )}>
        {navItems.slice(0, 2).map(renderNavItem)}
        
        {/* Spacer for Center Button */}
        <div className="w-[4.5rem] flex-shrink-0" />
        
        {navItems.slice(2, 4).map(renderNavItem)}

        {/* Center Record Button */}
        <Link 
          to="/record" 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-5 w-[68px] h-[68px] rounded-full flex items-center justify-center backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto transition-all duration-300 hover:scale-105 active:scale-95",
            isDarkMode 
              ? "bg-[#1c1c1e]/50 border border-white/10" 
              : "bg-white/50 border border-black/5"
          )}
        >
          <svg viewBox="0 0 100 100" className="w-10 h-10 opacity-90">
            <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="url(#grad1)" strokeWidth="2.5" />
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
        </Link>
      </div>
    </div>
  );
}
