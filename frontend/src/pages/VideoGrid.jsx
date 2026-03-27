import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play } from 'lucide-react';

export default function VideoGrid() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('/api/videos').then(res => setVideos(res.data)).catch(console.error);
  }, []);

  return (
    <div className="grid-container">
      {videos.length === 0 && <div className="empty-state">No videos found. Click Upload to get started!</div>}
      
      {videos.map(video => {
         const color1 = video.id.substring(0, 6) || '3ea6ff';
         const color2 = video.id.substring(4, 10) || 'ef4444';

         return (
          <Link to={`/watch/${video.id}`} key={video.id} className="video-card">
            <div className="thumbnail-wrapper">
               <div className="thumbnail-gradient" style={{ background: `linear-gradient(135deg, #${color1}, #${color2})` }}>
                  <div className="play-overlay">
                    <Play size={36} fill="white" color="white" />
                  </div>
               </div>
               <div className={`status-badge status-${video.status}`}>
                 {video.status.toUpperCase()}
               </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-meta">Uploaded • {new Date(video.createdAt).toLocaleDateString()}</p>
            </div>
          </Link>
         );
      })}
    </div>
  );
}
