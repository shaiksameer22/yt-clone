import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlaySquare } from 'lucide-react';

export default function VideoGrid() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch videos from Express API backend
    axios.get('/api/videos').then(res => setVideos(res.data)).catch(console.error);
  }, []);

  return (
    <div className="grid-container">
      {videos.map(video => (
        <Link to={`/watch/${video.id}`} key={video.id} className="video-card">
          <div className="thumbnail-placeholder">
            <PlaySquare size={48} />
          </div>
          <div className="video-info">
            <div className="video-title">{video.title}</div>
            <div className="video-meta">Uploaded: {new Date(video.createdAt).toLocaleDateString()}</div>
            <div className={`video-status status-${video.status}`}>
              {video.status.toUpperCase()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
