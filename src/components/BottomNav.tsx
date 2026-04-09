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
    <div className="fixed bottom-8 left-0 right-0 px-6 flex items-center justify-center z-50 pointer-events-none">
      {/* Main Navigation Pill */}
      <div className={cn(
        "flex items-center justify-between px-4 h-[70px] rounded-[40px] pointer-events-auto w-full max-w-[400px] bottom-nav-glass relative"
      )}>
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={cn(
                "nav-item-glass w-[50px] h-[50px] flex items-center justify-center",
                isActive && "active"
              )}
            >
              <Icon size={20} />
            </Link>
          );
        })}
        
        {/* Center Record Button (Add) */}
        <Link 
          to="/record" 
          className={cn(
            "nav-item-glass w-[50px] h-[50px] flex items-center justify-center",
            location.pathname === '/record' && "active"
          )}
        >
          <div className="w-3 h-3 rounded-full bg-current" />
        </Link>
        
        {navItems.slice(2, 4).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={cn(
                "nav-item-glass w-[50px] h-[50px] flex items-center justify-center",
                isActive && "active"
              )}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
