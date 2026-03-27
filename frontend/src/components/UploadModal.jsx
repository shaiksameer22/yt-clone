import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, X } from 'lucide-react';

export default function UploadModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !password || !file) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('password', password);
    formData.append('video', file);

    try {
      await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
           <h2><UploadCloud size={24} color="#3ea6ff" /> Upload Video</h2>
           <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        
        {error && <div className="error-alert">{error}</div>}
        
        <form onSubmit={handleUpload} className="upload-form">
          <div className="input-group">
             <label>Video Title</label>
             <input type="text" placeholder="E.g., My Awesome Vlog" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
             <label>Access Password</label>
             <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          
          <div className="file-drop-area">
             <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} disabled={loading} id="file-upload"/>
             <label htmlFor="file-upload" className="file-label">
                <UploadCloud size={32} color="#aaaaaa" />
                <span>{file ? file.name : 'Choose a video file or drop it here'}</span>
             </label>
          </div>
          
          {loading && (
             <div className="progress-container">
               <div className="progress-bar-bg">
                 <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="progress-text">{progress}% Uploaded</span>
             </div>
          )}
          
          <button type="submit" className="submit-btn primary-btn" disabled={loading || !file || !title || !password}>
            {loading ? 'Uploading...' : 'Start Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
