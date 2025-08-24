/**
 * SlitherChat.io - Chat Parser Sınıfı
 * YouTube chat iframe'inden mesajları çeker
 */

class ChatParser {
    /**
     * Yeni bir chat parser oluştur
     * @param {function} messageCallback - Yeni mesaj geldiğinde çağrılacak fonksiyon
     */
    constructor(messageCallback) {
        this.messageCallback = messageCallback;
        this.iframeContainer = document.getElementById('youtubeIframeContainer');
        this.lastMessageIds = new Set();
        this.connected = false;
        this.videoId = '';
        this.checkInterval = null;
        this.iframe = null;
    }
    
    /**
     * YouTube video ID'sinden bir URL oluştur
     * @param {string} videoIdOrUrl - Video ID'si veya URL'si
     * @returns {string} - Video ID
     */
    extractVideoId(videoIdOrUrl) {
        // URL veya ID olabilir
        let videoId = videoIdOrUrl.trim();
        
        // YouTube URL'lerinden ID'yi çıkar
        if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
            try {
                const url = new URL(videoId);
                
                if (videoId.includes('youtube.com/watch')) {
                    videoId = url.searchParams.get('v');
                } else if (videoId.includes('youtu.be')) {
                    videoId = url.pathname.substring(1);
                } else if (videoId.includes('youtube.com/live')) {
                    videoId = url.searchParams.get('v');
                } else if (videoId.includes('studio.youtube.com/video')) {
                    videoId = url.pathname.split('/').pop();
                    if (videoId.includes('_live')) {
                        videoId = videoId.replace('_live', '');
                    }
                }
            } catch (e) {
                console.error('Geçersiz URL:', e);
            }
        }
        
        return videoId;
    }
    
    /**
     * Chat'i bağla - Backend API kullanarak
     * @param {string} videoIdOrUrl - Video ID'si veya URL'si
     * @returns {Promise} - Bağlantı başarılı olduğunda resolve olan Promise
     */
    connect(videoIdOrUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                // Video ID'yi çıkar
                this.videoId = this.extractVideoId(videoIdOrUrl);
                
                if (!this.videoId) {
                    reject(new Error('Geçerli bir YouTube videosu ID\'si bulunamadı.'));
                    return;
                }
                
                console.log('Bağlanılıyor:', this.videoId);
                
                // Önceki bağlantıyı temizle
                this.disconnect();
                
                // Durumu güncelle
                this.connected = false;
                this.lastMessageIds.clear();
                
                // Simülasyon modu kontrolü
                if (CONFIG.simulationMode) {
                    console.warn('Simülasyon modu aktif - Chat API devre dışı bırakıldı');
                    this.startSimulation();
                    resolve();
                    return;
                }
                
                try {
                    // Backend API ile video bilgilerini kontrol et
                    const response = await fetch(`/api/video/${this.videoId}`);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Video bulunamadı');
                    }
                    
                    const videoData = await response.json();
                    
                    if (!videoData.liveChatId) {
                        throw new Error('Bu video için aktif canlı yayın sohbeti bulunamadı');
                    }
                    
                    // Bağlantı durumunu ayarla
                    this.connected = true;
                    this.liveChatId = videoData.liveChatId;
                    
                    console.log('Chat API bağlandı:', this.liveChatId);
                    
                    // İlk mesaj kontrolünü yap
                    this.parseMessages();
                    
                    // Başarılı
                    resolve();
                } catch (apiError) {
                    console.error('Chat API hatası:', apiError);
                    
                    // Kullanıcı dostu hata mesajı
                    if (apiError.message.includes('canlı yayın')) {
                        reject(new Error('Bu video için aktif canlı yayın sohbeti bulunamadı. Lütfen aktif bir yayın ID\'si girin.'));
                    } else {
                        reject(new Error('API bağlantı hatası: ' + apiError.message));
                    }
                    
                    // Hata durumunda simülasyon moduna geç
                    if (CONFIG.simulationMode) {
                        console.warn('API hatası nedeniyle simülasyon moduna geçiliyor');
                        this.startSimulation();
                        resolve();
                    }
                }
            } catch (error) {
                console.error('Chat bağlantısı genel hatası:', error);
                reject(error);
                
                // Hata durumunda simülasyon moduna geç
                if (CONFIG.simulationMode) {
                    this.startSimulation();
                    resolve();
                }
            }
        });
    }
    
    /**
     * Bağlantıyı kes
     */
    disconnect() {
        // Artık iframe kullanmadığımız için temizleme yapmıyoruz
        // Zamanlayıcıları temizle
        if (this.pollingTimeout) {
            clearTimeout(this.pollingTimeout);
            this.pollingTimeout = null;
        }
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        // Simülasyon varsa temizle
        if (this.simulationTimeout) {
            clearTimeout(this.simulationTimeout);
            this.simulationTimeout = null;
        }
        
        this.connected = false;
        console.log('Chat bağlantısı kesildi');
    }
    
    /**
     * Simülasyon modunu başlat
     */
    startSimulation() {
        console.log('Simülasyon modu başlatılıyor...');
        this.connected = true;
        
        // Periyodik olarak simüle edilmiş mesajlar gönder
        this.simulationInterval = setInterval(() => {
            const min = CONFIG.simulationChatInterval[0];
            const max = CONFIG.simulationChatInterval[1];
            const randomInterval = Math.random() * (max - min) + min;
            
            setTimeout(() => {
                const username = CONFIG.simulationUsernames[
                    Math.floor(Math.random() * CONFIG.simulationUsernames.length)
                ];
                
                const message = CONFIG.simulationMessages[
                    Math.floor(Math.random() * CONFIG.simulationMessages.length)
                ];
                
                const messageId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                this.messageCallback({
                    id: messageId,
                    authorName: username,
                    message: message,
                    timestamp: new Date().toISOString(),
                    authorPhotoUrl: null
                });
            }, randomInterval);
        }, 2000);
    }
    
    /**
     * Chat mesajlarını çek ve işle - Backend API kullanarak
     */
    parseMessages() {
        if (!this.connected) return;
        
        try {
            // Backend API'den mesajları al
            this.fetchMessagesFromApi();
        } catch (error) {
            console.error('Chat mesajları çekilemedi:', error);
            
            // Hata durumunda simülasyon moduna geç
            if (CONFIG.simulationMode) {
                console.warn('Gerçek chat okunmuyor, simülasyona geçiliyor');
                this.disconnect();
                this.startSimulation();
            }
        }
    }
    
    /**
     * Backend API'den mesajları al
     */
    async fetchMessagesFromApi() {
        try {
            // API endpoint'i
            const apiUrl = `/api/chat/${this.videoId}`;
            const url = new URL(apiUrl, window.location.origin);
            
            // Sayfa token'ı varsa ekle
            if (this.nextPageToken) {
                url.searchParams.append('pageToken', this.nextPageToken);
            }
            
            // API isteği gönder
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API hatası');
            }
            
            const data = await response.json();
            
            // Sonraki sayfa token'ını kaydet
            this.nextPageToken = data.nextPageToken;
            
            // Mesajları işle
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(message => {
                    // Bu mesajı daha önce işledik mi?
                    if (this.lastMessageIds.has(message.id)) {
                        return;
                    }
                    
                    // Mesajı işlendi olarak işaretle
                    this.lastMessageIds.add(message.id);
                    
                    // Maksimum 1000 ID tutarak belleği yönet
                    if (this.lastMessageIds.size > 1000) {
                        const firstId = this.lastMessageIds.values().next().value;
                        this.lastMessageIds.delete(firstId);
                    }
                    
                    // Mesajı callback ile geri döndür
                    this.messageCallback({
                        id: message.id,
                        authorName: message.authorName,
                        message: message.message,
                        timestamp: message.publishedAt,
                        authorPhotoUrl: message.authorProfileImageUrl
                    });
                });
            }
            
            // Bir sonraki kontrol için zamanlayıcı ayarla
            const pollingInterval = data.pollingIntervalMillis || CONFIG.chatCheckInterval;
            this.pollingTimeout = setTimeout(() => {
                this.parseMessages();
            }, pollingInterval);
            
        } catch (error) {
            console.error('API veri çekme hatası:', error);
            
            // Bir sonraki kontrol için zamanlayıcı ayarla (hata durumunda daha uzun aralık)
            this.pollingTimeout = setTimeout(() => {
                this.parseMessages();
            }, CONFIG.chatCheckInterval * 2);
        }
    }
}
