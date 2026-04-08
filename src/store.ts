import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export type Cocoon = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  size: number;
  isVisibleOnHome?: boolean;
};

export type Note = {
  id: string;
  cocoonId: string;
  text: string;
  type: 'text' | 'audio';
  createdAt: number;
  audioBase64?: string;
  imageBase64?: string;
  location?: { lat: number; lng: number };
};

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  whisperModel: string;
  setWhisperModel: (model: string) => void;
  cocoons: Cocoon[];
  addCocoon: (cocoon: Omit<Cocoon, 'id'>) => void;
  updateCocoonPosition: (id: string, x: number, y: number) => void;
  updateCocoon: (id: string, data: Partial<Cocoon>) => void;
  deleteCocoon: (id: string) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

const INITIAL_COCOONS: Cocoon[] = [
  { id: '1', name: 'Ideas', color: '#facc15', x: 100, y: 100, size: 100, isVisibleOnHome: true },
  { id: '2', name: 'Grateful', color: '#ef4444', x: 200, y: 180, size: 120, isVisibleOnHome: true },
  { id: '3', name: 'Shopping', color: '#3b82f6', x: 80, y: 250, size: 90, isVisibleOnHome: true },
  { id: '4', name: 'Remember', color: '#f87171', x: 220, y: 350, size: 110, isVisibleOnHome: true },
  { id: '5', name: 'Journal', color: '#fbbf24', x: 120, y: 450, size: 100, isVisibleOnHome: true },
];

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      whisperModel: 'Xenova/whisper-tiny',
      setWhisperModel: (model) => set({ whisperModel: model }),
      cocoons: INITIAL_COCOONS,
      addCocoon: (cocoon) =>
        set((state) => ({
          cocoons: [
            ...state.cocoons,
            { ...cocoon, id: Math.random().toString(36).substring(2, 9), isVisibleOnHome: true },
          ],
        })),
      updateCocoonPosition: (id, x, y) =>
        set((state) => ({
          cocoons: state.cocoons.map((c) =>
            c.id === id ? { ...c, x, y } : c
          ),
        })),
      updateCocoon: (id, data) =>
        set((state) => ({
          cocoons: state.cocoons.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCocoon: (id) =>
        set((state) => ({
          cocoons: state.cocoons.filter((c) => c.id !== id),
          notes: state.notes.filter((n) => n.cocoonId !== id),
        })),
      notes: [],
      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: Date.now(),
            },
          ],
        })),
      updateNote: (id, data) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...data } : n
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'cocoon-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
