import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PlaySquare, Upload, Compass } from 'lucide-react';
import VideoGrid from './pages/VideoGrid';
import VideoPlayer from './pages/VideoPlayer';
import UploadModal from './components/UploadModal';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <Router>
      <div className="app-container">
        {/* Sleek Dark Sidebar */}
        <nav className="sidebar">
           <Link to="/" className="logo">
             <div className="logo-icon-bg"><PlaySquare color="#ffffff" size={20} style={{ fill: 'transparent' }} strokeWidth={2.5} /></div>
             <span className="logo-text">MyTube</span>
           </Link>
           <div className="nav-links">
             <Link to="/" className="nav-link active"><Compass size={20} /> Discover</Link>
           </div>
        </nav>

        {/* Main Interface Area */}
        <main className="main-content">
          <header className="topbar glass-panel">
            <div className="search-bar-placeholder">
               <input type="text" placeholder="Search videos..." disabled/>
            </div>
            <button className="primary-btn upload-nav-btn" onClick={() => setIsUploadOpen(true)} title="Upload Video">
              <Upload size={18} /> <span className="upload-nav-text">Upload</span>
            </button>
          </header>
          
          <div className="content-scroll">
            <Routes>
              <Route path="/" element={<VideoGrid />} />
              <Route path="/watch/:id" element={<VideoPlayer />} />
            </Routes>
          </div>
        </main>

        {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} />}
      </div>
    </Router>
  );
}
