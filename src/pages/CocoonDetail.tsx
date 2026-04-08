import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, MoreHorizontal, Plus, Play } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function CocoonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cocoons, notes, isDarkMode } = useStore();
  
  const cocoon = cocoons.find(c => c.id === id);
  const cocoonNotes = notes.filter(n => n.cocoonId === id).sort((a, b) => b.createdAt - a.createdAt);

  if (!cocoon) return null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1c1c1e]">
      <div className="flex items-center justify-between p-4 pt-safe">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 opacity-70 hover:opacity-100">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs opacity-50 font-medium">Home</span>
            <h1 className="text-xl font-medium">{cocoon.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 opacity-70">
          <button className="hover:opacity-100"><Search size={20} /></button>
          <button className="hover:opacity-100"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {cocoonNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-lg mb-8">You haven't created<br/>any notes yet</p>
            
            <div className="flex items-center gap-4 mb-6 text-left">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </div>
              <div>
                <p className="font-medium">Tap the CocoonWeaver icon</p>
                <p className="text-sm opacity-70">to start an audio recording</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <Plus size={16} />
              </div>
              <div>
                <p className="font-medium">Tap + Note below</p>
                <p className="text-sm opacity-70">to create a regular text note</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            {cocoonNotes.map(note => (
              <div 
                key={note.id} 
                className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <div className="flex justify-center mb-4">
                  <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium opacity-70">
                    {format(note.createdAt, 'EEEE, MMM do')}
                  </div>
                </div>
                
                <h3 className="text-xl font-medium leading-tight mb-3">
                  {note.text.length > 60 ? note.text.substring(0, 60) + '...' : note.text}
                </h3>
                
                {note.type === 'audio' && (
                  <div className="flex items-center gap-3">
                    {note.imageBase64 && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10">
                        <img src={note.imageBase64} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: cocoon.color }}>
                      <Play size={14} fill="currentColor" />
                      <span>1st thought</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 pb-safe flex items-center justify-between border-t backdrop-blur-md",
        isDarkMode ? "bg-black/50 border-white/10" : "bg-white/50 border-black/5"
      )}>
        <button 
          onClick={() => {
            useStore.getState().addNote({
              cocoonId: cocoon.id,
              text: "This is a new text note added manually.",
              type: 'text'
            });
          }}
          className="flex items-center gap-2 opacity-70 hover:opacity-100 font-medium"
        >
          <Plus size={20} /> Note
        </button>
        
        <button 
          onClick={() => navigate('/record')}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: cocoon.color }}
        >
           <svg viewBox="0 0 100 100" className="w-6 h-6 text-white">
              <path d="M50 10 C20 30, 10 60, 50 90 C90 60, 80 30, 50 10 Z" fill="none" stroke="currentColor" strokeWidth="4" />
           </svg>
        </button>
        
        <div className="w-20" /> {/* Spacer for balance */}
      </div>
    </div>
  );
}
