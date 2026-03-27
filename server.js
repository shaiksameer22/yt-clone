require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'secretpassword';

// Middleware
app.use(cors());
app.use(express.json());

// Set up directories
const uploadsTempDir = path.join(__dirname, 'uploads_temp');
const uploadsHlsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsTempDir)) fs.mkdirSync(uploadsTempDir);
if (!fs.existsSync(uploadsHlsDir)) fs.mkdirSync(uploadsHlsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsTempDir),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage });

// API Routes
app.get('/api/videos', (req, res) => {
    db.all(`SELECT id, title, status, createdAt FROM videos ORDER BY createdAt DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/videos/:id', (req, res) => {
    db.get(`SELECT id, title, status, createdAt FROM videos WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Video not found' });
        res.json(row);
    });
});

app.use('/uploads', express.static(uploadsHlsDir));

app.post('/api/upload', upload.single('video'), (req, res) => {
    const { title, password } = req.body;

    if (password !== UPLOAD_PASSWORD) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }

    if (!req.file || !title) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Missing title or video file' });
    }

    const videoId = uuidv4();
    const tempPath = req.file.path;
    const outputDir = path.join(uploadsHlsDir, videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    // Store in DB
    db.run(`INSERT INTO videos (id, title, status) VALUES (?, ?, 'processing')`, [videoId, title], (err) => {
        if (err) {
            fs.unlinkSync(tempPath);
            return res.status(500).json({ error: err.message });
        }
        res.status(202).json({ message: 'Video uploaded and processing', id: videoId });

        // Start FFmpeg HLS Transcoding for Quality Switching
        // Creating two qualities for demonstration: 360p and 720p
        ffmpeg(tempPath)
            .outputOptions([
                '-map 0:v:0', '-map 0:a:0',
                '-map 0:v:0', '-map 0:a:0',
                '-c:v libx264', '-c:a aac',
                '-b:v:0 800k', '-s:v:0 640x360', '-profile:v:0 main',
                '-b:v:1 2800k', '-s:v:1 1280x720', '-profile:v:1 main',
                '-var_stream_map', 'v:0,a:0,name:360p v:1,a:1,name:720p',
                '-master_pl_name master.m3u8',
                '-f hls',
                '-hls_time 10',
                '-hls_list_size 0',
                '-hls_segment_filename', path.join(outputDir, '%v_%03d.ts')
            ])
            .output(path.join(outputDir, '%v.m3u8'))
            .on('end', () => {
                db.run(`UPDATE videos SET status = 'ready' WHERE id = ?`, [videoId]);
                fs.unlinkSync(tempPath);
            })
            .on('error', (err) => {
                console.error('FFmpeg HLS Error:', err);
                db.run(`UPDATE videos SET status = 'error' WHERE id = ?`, [videoId]);
                try { fs.unlinkSync(tempPath); } catch (e) {}
            })
            .run();
    });
});

// Serve Frontend Build
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`YouTube clone running on port ${PORT}`);
});
