import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

export default function VideoPlayer() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [videoMeta, setVideoMeta] = useState(null);

  useEffect(() => {
    axios.get(`/api/videos/${id}`).then(res => setVideoMeta(res.data)).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!videoRef.current || !videoMeta || videoMeta.status !== 'ready') return;

    const video = videoRef.current;
    const source = `/uploads/${id}/master.m3u8`;
    
    // Default Plyr options targeting YouTube features
    const defaultOptions = {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['quality', 'speed', 'loop']
    };

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(source);
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
             const availableQualities = hls.levels.map(l => l.height);
             
             defaultOptions.quality = {
                default: availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: (e) => updateQuality(e)
             };

             new Plyr(video, defaultOptions);
             window.hls = hls; // Keep ref for quality updating
        });
        hls.attachMedia(video);
        
        function updateQuality(newQuality) {
            window.hls.levels.forEach((level, levelIndex) => {
                if (level.height === newQuality) {
                    window.hls.currentLevel = levelIndex;
                }
            });
        }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) { // Fallback for native Safari
        video.src = source;
        new Plyr(video, defaultOptions);
    }
  }, [id, videoMeta]);

  if (!videoMeta) return <div style={{padding:'24px'}}>Loading...</div>;

  return (
    <div className="player-container">
      <div className="player-wrapper">
        {videoMeta.status === 'ready' ? (
             <video ref={videoRef} controls crossOrigin="anonymous" playsInline></video>
        ) : (
             <div style={{color:'white', display:'flex',height:'100%',alignItems:'center',justifyContent:'center'}}>
                <h2>Video is currently {videoMeta.status}. Please wait.</h2>
             </div>
        )}
      </div>
      <div className="player-details">
         <div className="player-title">{videoMeta.title}</div>
         <div className="player-meta">Uploaded on {new Date(videoMeta.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
