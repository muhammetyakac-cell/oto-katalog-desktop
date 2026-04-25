import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Play, Pause, Volume2, Radio } from 'lucide-react';
// Tauri v2 için gerekli updater ve process importları
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/api/process';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';

// --- RADYO İSTASYONLARI ---
const STATIONS = [
  { name: 'Arabesk FM (Arabesk)', url: 'http://anadolu.liderhost.com.tr:6688/;' },
  { name: "Power FM", genre: "Yabancı Pop", url: "https://listen.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8", type: "m3u8" },
  { name: "PowerTürk", genre: "Türkçe Pop", url: "https://listen.powerapp.com.tr/powerturk/abr/powerturk/128/playlist.m3u8", type: "m3u8" },
  { name: "Alem FM", genre: "Türkçe Pop", url: "https://turkmedya.radyotvonline.net/alemfmaac", type: "aac" },
  { name: "PowerTürk Dans", genre: "Dans", url: "https://listen.powerapp.com.tr/powerturkdans/abr/powerturkdans/128/playlist.m3u8", type: "m3u8" },
  { name: "PowerTürk Akustik", genre: "Akustik", url: "https://listen.powerapp.com.tr/powerturkakustik/abr/powerturkakustik/128/playlist.m3u8", type: "m3u8" },
  { name: "Akustikland", genre: "Akustik", url: "https://moondigitaledge.radyotvonline.net/akustikland/playlist.m3u8", type: "m3u8" },
  { name: "Power Smooth Jazz", genre: "Jazz / Lounge", url: "https://listen.powerapp.com.tr/powersmoothjazz/abr/powersmoothjazz/128/playlist.m3u8", type: "m3u8" },
  { name: "Borusan Klasik", genre: "Klasik Müzik", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/BORUSAN_KLASIK_SC", type: "mp3" },
  { name: "90'lar", genre: "90'lar", url: "https://moondigitalmaster.radyotvonline.net/90lar/playlist.m3u8", type: "m3u8" },
  { name: "Doksanlar", genre: "90'lar", url: "https://moondigitaledge.radyotvonline.net/radyolanddoksanlar/playlist.m3u8", type: "m3u8" },
  { name: "Arabeskland", genre: "Arabesk", url: "https://moondigitalmaster.radyotvonline.net/arabeskland/playlist.m3u8", type: "m3u8" },
  { name: 'Baba Radyo (Arabesk)', url: 'http://37.247.98.7:80/;stream.mp3' },
  { name: 'Pal Nostalji (90lar)', url: 'http://shoutcast.radyogrup.com:1010/;' }
];

// --- RADYO PLAYER BİLEŞENİ ---
function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(currentStation.url);
    audioRef.current.volume = volume;
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = currentStation.url;
      audioRef.current.play().catch(() => console.log("Yükleniyor..."));
    }
    setIsPlaying(!isPlaying);
  };

  const changeStation = (station) => {
    setCurrentStation(station);
    if (audioRef.current) {
      audioRef.current.src = station.url;
      if (isPlaying) audioRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 px-6 flex items-center justify-between z-[9999] shadow-2xl">
      <div className="flex items-center gap-4 w-1/3">
        <div className={`p-2.5 rounded-xl ${isPlaying ? 'bg-blue-600 animate-pulse' : 'bg-slate-800'}`}>
          <Radio className="text-white w-5 h-5" />
        </div>
        <div className="hidden md:block overflow-hidden">
          <p className="text-[10px] text-blue-400 font-black uppercase mb-0.5 tracking-tighter">CANLI MÜZİK</p>
          <p className="text-sm text-white font-bold truncate">{currentStation.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <select 
          value={currentStation.name}
          onChange={(e) => changeStation(STATIONS.find(s => s.name === e.target.value))}
          className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none border border-slate-700"
        >
          {STATIONS.map(s => <option key={s.name} value={s.name} className="bg-slate-900">{s.name}</option>)}
        </select>
        <button onClick={togglePlay} className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg">
          {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
        </button>
      </div>
      <div className="flex items-center justify-end gap-3 w-1/3">
        <Volume2 className="w-4 h-4 text-slate-400" />
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => {
          const v = parseFloat(e.target.value);
          setVolume(v);
          if (audioRef.current) audioRef.current.volume = v;
        }} className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
      </div>
    </div>
  );
}

// --- ANA UYGULAMA ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuth') === 'true');

  // --- GÜNCELLEME KONTROL SİSTEMİ ---
  useEffect(() => {
    async function setupUpdater() {
      try {
        // Yeni bir sürüm var mı kontrol et
        const update = await check();
        
        if (update) {
          console.log(`Yeni sürüm bulundu: v${update.version}`);
          
          // Kullanıcıya güncelleme bildirimi çıkar
          const confirmUpdate = window.confirm(
            `Yeni bir güncelleme mevcut (v${update.version}). Şimdi yükleyip yeniden başlatmak ister misiniz?`
          );

          if (confirmUpdate) {
            // Önce güncellemeyi indir ve kur
            await update.downloadAndInstall();
            // Sonra uygulamayı yeni sürümle tekrar aç
            await relaunch();
          }
        } else {
          console.log("Uygulama zaten en son sürümde.");
        }
      } catch (error) {
        console.error("Güncelleme hatası:", error);
      }
    }

    setupUpdater();
  }, []);

  const handleLoginStatus = (status) => {
    setIsAuthenticated(status);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLoginStatus} />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/editor" 
            element={isAuthenticated ? <Editor /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <RadioPlayer />
      </div>
    </BrowserRouter>
  );
}

export default App;