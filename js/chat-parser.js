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
     * Chat'i bağla
     * @param {string} videoIdOrUrl - Video ID'si veya URL'si
     * @returns {Promise} - Bağlantı başarılı olduğunda resolve olan Promise
     */
    connect(videoIdOrUrl) {
        return new Promise((resolve, reject) => {
            try {
                // Video ID'yi çıkar
                this.videoId = this.extractVideoId(videoIdOrUrl);
                
                if (!this.videoId) {
                    reject(new Error('Geçerli bir YouTube videosu ID\'si bulunamadı.'));
                    return;
                }
                
                console.log('Bağlanılıyor:', this.videoId);
                
                // Önceki iframe'i temizle
                this.disconnect();
                
                // Durumu güncelle
                this.connected = false;
                this.lastMessageIds.clear();
                
                // iframe oluştur ve yükle
                this.iframe = document.createElement('iframe');
                const hostname = window.location.hostname || 'localhost';
                this.iframe.src = `https://www.youtube.com/live_chat?v=${this.videoId}&embed_domain=${hostname}`;
                console.log(`Chat iframe URL: ${this.iframe.src}, Host: ${hostname}`);
                this.iframe.width = '1280px';
                this.iframe.height = '720px';
                this.iframeContainer.appendChild(this.iframe);
                
                // iframe yüklendiğinde olayı
                this.iframe.onload = () => {
                    console.log('Chat iframe yüklendi');
                    
                    // Bağlantı durumunu ayarla
                    this.connected = true;
                    
                    // Mesajları periyodik olarak kontrol et
                    this.checkInterval = setInterval(() => {
                        this.parseMessages();
                    }, CONFIG.chatCheckInterval);
                    
                    // Başarılı
                    resolve();
                };
                
                // iframe yüklenmezse
                this.iframe.onerror = (error) => {
                    console.error('Chat iframe yüklenemedi:', error);
                    reject(new Error('Chat yüklenemedi. Video geçerli bir canlı yayın olabilir mi?'));
                };
                
                // 10 saniye zaman aşımı
                setTimeout(() => {
                    if (!this.connected) {
                        reject(new Error('Bağlantı zaman aşımına uğradı. Canlı yayın aktif değil olabilir.'));
                    }
                }, 10000);
                
                // Eğer bağlanılır bağlanılmaz simülasyon moduna geçilecekse
                if (CONFIG.simulationMode) {
                    console.warn('Simülasyon modu aktif - Chat API devre dışı bırakıldı');
                    this.startSimulation();
                    resolve();
                }
            } catch (error) {
                console.error('Chat bağlantısı hatası:', error);
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
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
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
     * Chat mesajlarını çek ve işle
     */
    parseMessages() {
        if (!this.connected || !this.iframe) return;
        
        try {
            // iframe içindeki chat-frame'i bul
            const chatFrame = this.iframe.contentDocument || this.iframe.contentWindow.document;
            
            // Tüm mesaj elementlerini bul
            const chatItems = chatFrame.querySelectorAll('yt-live-chat-text-message-renderer');
            
            if (!chatItems || chatItems.length === 0) {
                return;
            }
            
            // Her mesajı işle
            chatItems.forEach(item => {
                try {
                    // Mesaj ID'sini al
                    const messageId = item.id;
                    
                    // Bu mesajı daha önce işledik mi?
                    if (this.lastMessageIds.has(messageId)) {
                        return;
                    }
                    
                    // Mesajı işlendi olarak işaretle
                    this.lastMessageIds.add(messageId);
                    
                    // Maksimum 1000 ID tutarak belleği yönet
                    if (this.lastMessageIds.size > 1000) {
                        const firstId = this.lastMessageIds.values().next().value;
                        this.lastMessageIds.delete(firstId);
                    }
                    
                    // Yazar bilgilerini al
                    const authorElement = item.querySelector('#author-name');
                    const authorName = authorElement ? authorElement.textContent.trim() : 'Anonim';
                    
                    // Mesaj metnini al
                    const messageElement = item.querySelector('#message');
                    const message = messageElement ? messageElement.textContent.trim() : '';
                    
                    // Zaman damgasını al (varsa)
                    const timestampElement = item.querySelector('#timestamp');
                    const timestamp = timestampElement ? timestampElement.textContent.trim() : '';
                    
                    // Profil fotoğrafını al
                    const authorPhotoElement = item.querySelector('#img');
                    const authorPhotoUrl = authorPhotoElement ? authorPhotoElement.src : null;
                    
                    // Mesajı callback ile geri döndür
                    this.messageCallback({
                        id: messageId,
                        authorName: authorName,
                        message: message,
                        timestamp: timestamp,
                        authorPhotoUrl: authorPhotoUrl
                    });
                    
                } catch (itemError) {
                    console.warn('Mesaj ayrıştırma hatası:', itemError);
                }
            });
        } catch (error) {
            console.error('Chat mesajları çekilemedi:', error);
            
            // Eğer iframe erişilemez olursa, simülasyon moduna geç
            if (CONFIG.simulationMode) {
                console.warn('Gerçek chat okunmuyor, simülasyona geçiliyor');
                this.disconnect();
                this.startSimulation();
            }
        }
    }
}
