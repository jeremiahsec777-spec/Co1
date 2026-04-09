import React, { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useStore, Cocoon } from '@/store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CocoonSettingsModal } from './CocoonSettingsModal';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Focus, Heart, Lightbulb, ShoppingBag, Pin, Book, HelpCircle } from 'lucide-react';

const IconMap: Record<string, any> = {
  Heart,
  Lightbulb,
  ShoppingBag,
  Pin,
  Book,
};

export function CocoonCanvas() {
  const { cocoons, updateCocoonPosition, isDarkMode } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCocoonId, setSelectedCocoonId] = useState<string | null>(null);

  const visibleCocoons = cocoons
    .filter(c => c.isVisibleOnHome !== false)
    .sort((a, b) => {
      // Put Journal at the top
      if (a.name === 'Journal') return -1;
      if (b.name === 'Journal') return 1;
      return a.name.localeCompare(b.name);
    })
    .map((c, index) => {
      let x, y, size;
      
      if (c.name === 'Journal') {
        // Large top bubble (180px)
        x = (window.innerWidth / 2) - 90; // Center of 180px
        y = 50;
        size = 180;
      } else {
        // 2x2 Grid below (130px bubbles, 25px gap)
        const gridIndex = index - 1;
        const row = Math.floor(gridIndex / 2);
        const col = gridIndex % 2;
        const bubbleSize = 130;
        const gap = 25;
        const gridWidth = (bubbleSize * 2) + gap;
        
        const startX = (window.innerWidth / 2) - (gridWidth / 2);
        x = startX + (col * (bubbleSize + gap));
        y = 270 + (row * (bubbleSize + gap));
        size = bubbleSize;
      }
      
      return { ...c, x, y, size };
    });

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      {isEditMode && (
        <div className="absolute top-safe right-4 z-20 pt-4">
          <button 
            onClick={() => setIsEditMode(false)}
            className="font-medium px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full backdrop-blur-md"
          >
            Done
          </button>
        </div>
      )}

      {!isEditMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-sm font-medium text-center z-0">
          Tap and hold to position Categories
        </div>
      )}

      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={4}
        limitToBounds={false}
        panning={{ disabled: isEditMode }}
        pinch={{ disabled: isEditMode }}
        doubleClick={{ disabled: true }}
      >
        {({ setTransform }) => {
          const handleCenter = () => {
            if (visibleCocoons.length === 0) {
              setTransform(0, 0, 1, 400);
              return;
            }

            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            visibleCocoons.forEach(c => {
              if (c.x < minX) minX = c.x;
              if (c.x + c.size > maxX) maxX = c.x + c.size;
              if (c.y < minY) minY = c.y;
              if (c.y + c.size > maxY) maxY = c.y + c.size;
            });

            const boxWidth = maxX - minX;
            const boxHeight = maxY - minY;
            const boxCenterX = minX + boxWidth / 2;
            const boxCenterY = minY + boxHeight / 2;

            const viewportWidth = containerRef.current?.clientWidth || window.innerWidth;
            const viewportHeight = containerRef.current?.clientHeight || (window.innerHeight - 80);

            // Add 50% margin (multiply box size by 1.5)
            const paddedBoxWidth = Math.max(boxWidth * 1.5, 400); 
            const paddedBoxHeight = Math.max(boxHeight * 1.5, 400);

            const scaleX = viewportWidth / paddedBoxWidth;
            const scaleY = viewportHeight / paddedBoxHeight;
            const scale = Math.min(scaleX, scaleY, 1.5); // Cap max zoom level

            const positionX = (viewportWidth / 2) - (boxCenterX * scale);
            const positionY = (viewportHeight / 2) - (boxCenterY * scale);

            setTransform(positionX, positionY, scale, 400);
          };

          return (
            <>
              <div className="absolute top-safe left-4 z-20 pt-4">
                <button 
                  onClick={handleCenter}
                  className="p-3 bg-black/5 dark:bg-white/10 rounded-full backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors shadow-sm"
                  title="Center Categories"
                >
                  <Focus size={20} />
                </button>
              </div>
              <TransformComponent 
                wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }} 
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <div className="relative w-full h-full" ref={containerRef}>
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
                </div>
              </TransformComponent>
            </>
          );
        }}
      </TransformWrapper>

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

  const IconComponent = cocoon.icon ? IconMap[cocoon.icon] || HelpCircle : HelpCircle;

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
      dragElastic={0.2}
      dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }}
      initial={{ x: cocoon.x, y: cocoon.y }}
      animate={isEditMode ? {
        scale: [1, 1.05, 1],
        rotate: [-1, 1, -1],
        transition: { repeat: Infinity, duration: 0.3 }
      } : {
        scale: 1,
        rotate: 0,
        x: cocoon.x,
        y: cocoon.y
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setTimeout(() => setIsDragging(false), 100);
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
        "absolute flex flex-col items-center justify-center cursor-pointer touch-none select-none",
        "transition-transform active:scale-95 glass-bubble"
      )}
      style={{
        width: cocoon.size,
        height: cocoon.size,
        color: cocoon.color,
      } as React.CSSProperties}
    >
      <IconComponent size={cocoon.name === 'Journal' ? 36 : 24} className="mb-2" fill="currentColor" />
      <span className="glass-bubble-text text-center break-words leading-tight" style={{ fontSize: cocoon.name === 'Journal' ? 18 : 14 }}>
        {cocoon.name}
      </span>
    </motion.div>
  );
}
