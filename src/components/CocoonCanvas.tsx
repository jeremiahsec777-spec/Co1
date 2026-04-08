import React, { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useStore, Cocoon } from '@/store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CocoonSettingsModal } from './CocoonSettingsModal';

export function CocoonCanvas() {
  const { cocoons, updateCocoonPosition, isDarkMode } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCocoonId, setSelectedCocoonId] = useState<string | null>(null);

  const visibleCocoons = cocoons.filter(c => c.isVisibleOnHome !== false);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden" ref={containerRef}>
      {isEditMode && (
        <div className="absolute top-safe right-4 z-10 pt-4">
          <button 
            onClick={() => setIsEditMode(false)}
            className="font-medium px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full"
          >
            Done
          </button>
        </div>
      )}

      {visibleCocoons.map((cocoon) => (
        <CocoonNode
          key={cocoon.id}
          cocoon={cocoon}
          containerRef={containerRef}
          isDarkMode={isDarkMode}
          isEditMode={isEditMode}
          onUpdatePosition={updateCocoonPosition}
          onClick={() => {
            if (isEditMode) {
              setSelectedCocoonId(cocoon.id);
            } else {
              navigate(`/cocoon/${cocoon.id}`);
            }
          }}
          onLongPress={() => setIsEditMode(true)}
        />
      ))}
      
      {!isEditMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-sm font-medium text-center">
          Tap and hold to position Cocoons
        </div>
      )}

      {selectedCocoonId && (
        <CocoonSettingsModal 
          cocoonId={selectedCocoonId} 
          onClose={() => setSelectedCocoonId(null)} 
        />
      )}
    </div>
  );
}

function CocoonNode({
  cocoon,
  containerRef,
  isDarkMode,
  isEditMode,
  onUpdatePosition,
  onClick,
  onLongPress
}: {
  key?: string | number;
  cocoon: Cocoon;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDarkMode: boolean;
  isEditMode: boolean;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onClick: () => void;
  onLongPress: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handlePointerDown = (e: React.PointerEvent) => {
    controls.start(e);
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <motion.div
      drag={isEditMode}
      dragControls={controls}
      dragMomentum={false}
      dragConstraints={containerRef}
      dragElastic={0.1}
      initial={{ x: cocoon.x, y: cocoon.y }}
      animate={isEditMode ? {
        scale: [1, 1.05, 1],
        rotate: [-1, 1, -1],
        transition: { repeat: Infinity, duration: 0.3 }
      } : {
        scale: 1,
        rotate: 0
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setTimeout(() => setIsDragging(false), 100);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
           // Simplified position update
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => {
        if (!isDragging) {
          onClick();
        }
      }}
      className={cn(
        "absolute rounded-full flex items-center justify-center cursor-pointer touch-none select-none",
        "transition-colors active:scale-95",
        isDarkMode ? "bg-[#1c1c1e] border-[1.5px]" : "shadow-sm"
      )}
      style={{
        width: cocoon.size,
        height: cocoon.size,
        x: cocoon.x,
        y: cocoon.y,
        backgroundColor: isDarkMode ? '#1c1c1e' : cocoon.color,
        borderColor: isDarkMode ? cocoon.color : 'transparent',
        color: 'white',
      }}
    >
      <span className="font-medium text-sm px-2 text-center break-words leading-tight">
        {cocoon.name}
      </span>
    </motion.div>
  );
}
