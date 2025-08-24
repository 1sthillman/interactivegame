const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// CORS ayarları
app.use(cors());

// Static dosyaları serve et
app.use(express.static(path.join(__dirname)));

// API anahtarı ve YouTube API'si
const API_KEY = 'AIzaSyAVnlhhzSjXt9x6os1ZkUx44wmBBSWYUTU';
const youtube = google.youtube({
  version: 'v3',
  auth: API_KEY
});

// Live chat mesajlarını getiren endpoint
app.get('/api/chat/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { pageToken } = req.query;
    
    // Önce video detaylarını al ve canlı yayın ID'sini bul
    const videoResponse = await youtube.videos.list({
      part: 'liveStreamingDetails',
      id: videoId
    });
    
    // Video bulunamadı veya canlı yayın yok
    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({ error: 'Video bulunamadı veya canlı yayın yok' });
    }
    
    const liveChatId = videoResponse.data.items[0].liveStreamingDetails?.activeLiveChatId;
    
    if (!liveChatId) {
      return res.status(404).json({ error: 'Bu video için aktif canlı yayın sohbeti bulunamadı' });
    }
    
    // Chat mesajlarını al
    const chatResponse = await youtube.liveChatMessages.list({
      part: 'snippet,authorDetails',
      liveChatId: liveChatId,
      pageToken: pageToken || undefined
    });
    
    // Mesajları işle
    const messages = chatResponse.data.items.map(item => ({
      id: item.id,
      authorId: item.authorDetails.channelId,
      authorName: item.authorDetails.displayName,
      authorProfileImageUrl: item.authorDetails.profileImageUrl,
      message: item.snippet.displayMessage,
      publishedAt: item.snippet.publishedAt
    }));
    
    res.json({
      messages,
      nextPageToken: chatResponse.data.nextPageToken,
      pollingIntervalMillis: chatResponse.data.pollingIntervalMillis
    });
  } catch (error) {
    console.error('Chat API hatası:', error.message);
    res.status(500).json({ 
      error: 'Chat mesajları alınamadı', 
      details: error.message 
    });
  }
});

// Video bilgilerini getiren endpoint
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const response = await youtube.videos.list({
      part: 'snippet,liveStreamingDetails',
      id: videoId
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video bulunamadı' });
    }
    
    const videoData = response.data.items[0];
    res.json({
      id: videoData.id,
      title: videoData.snippet.title,
      channelTitle: videoData.snippet.channelTitle,
      liveChatId: videoData.liveStreamingDetails?.activeLiveChatId || null,
      isLiveNow: videoData.liveStreamingDetails?.actualEndTime ? false : true
    });
  } catch (error) {
    console.error('Video API hatası:', error.message);
    res.status(500).json({ error: 'Video bilgileri alınamadı' });
  }
});

// Server'ı başlat
app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
});
