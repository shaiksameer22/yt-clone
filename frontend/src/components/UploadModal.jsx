import React, { useState } from 'react';
import axios from 'axios';

export default function UploadModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !password || !file) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('password', password);
    formData.append('video', file);

    try {
      await axios.post('/api/upload', formData);
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Upload Video</h2>
        {error && <div style={{color: 'red'}}>{error}</div>}
        <form onSubmit={handleUpload} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <input 
            type="text" 
            placeholder="Video Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            disabled={loading} 
          />
          <input 
            type="password" 
            placeholder="Upload Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            disabled={loading} 
          />
          <input 
            type="file" 
            accept="video/*" 
            onChange={e => setFile(e.target.files[0])} 
            disabled={loading} 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
