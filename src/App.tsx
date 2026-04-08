/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { CreateCocoon } from '@/pages/CreateCocoon';
import { CocoonDetail } from '@/pages/CocoonDetail';
import { NoteDetail } from '@/pages/NoteDetail';
import { Settings } from '@/pages/Settings';
import { ListView } from '@/pages/ListView';
import { RecordScreen } from '@/pages/RecordScreen';
import { MapView } from '@/pages/MapView';
import { BottomNav } from '@/components/BottomNav';
import { useStore } from '@/store';

function AppContent() {
  const location = useLocation();
  const isDarkMode = useStore((state) => state.isDarkMode);
  
  // Hide bottom nav on certain routes
  const showBottomNav = ['/', '/list', '/favorites', '/map'].includes(location.pathname);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden shadow-2xl bg-inherit">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCocoon />} />
        <Route path="/cocoon/:id" element={<CocoonDetail />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/list" element={<ListView />} />
        <Route path="/record" element={<RecordScreen />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
