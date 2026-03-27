import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PlaySquare, Upload } from 'lucide-react';
import VideoGrid from './pages/VideoGrid';
import VideoPlayer from './pages/VideoPlayer';
import UploadModal from './components/UploadModal';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <Router>
      <div className="topbar">
        <Link to="/" className="logo">
          <PlaySquare color="#ff0000" fill="#ff0000" size={28} />
          <span>MyTube</span>
        </Link>
        <button className="icon-button" onClick={() => setIsUploadOpen(true)} title="Upload Video">
          <Upload size={24} />
        </button>
      </div>
      
      <Routes>
        <Route path="/" element={<VideoGrid />} />
        <Route path="/watch/:id" element={<VideoPlayer />} />
      </Routes>

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} />}
    </Router>
  );
}
