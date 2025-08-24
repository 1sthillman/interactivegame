/**
 * SlitherChat.io - Ana Uygulama Sınıfı
 */
document.addEventListener('DOMContentLoaded', () => {
    // Ana uygulama
    const app = new SlitherChatApp();
    
    // Global olarak erişilebilir olması için
    window.slitherApp = app;
});

class SlitherChatApp {
    constructor() {
        // Canvas ve oyun nesneleri
        this.canvas = document.getElementById('gameCanvas');
        this.game = new Game(this.canvas);
        
        // Chat yönetimi
        this.chatParser = new ChatParser(message => this.onChatMessage(message));
        this.chatMessages = document.getElementById('chatMessages');
        
        // UI elementleri
        this.youtubeUrlInput = document.getElementById('youtubeUrl');
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        // Durum
        this.isConnected = false;
        this.snakeColors = {};
        
        // Event Listeners
        this.setupEventListeners();
        
        // Simülasyon modunu kontrol et
        if (CONFIG.simulationMode) {
            this.updateConnectionStatus('Simülasyon modu', 'connected');
        }
    }
    
    /**
     * Olay dinleyicilerini ayarla
     */
    setupEventListeners() {
        // Başlat butonu
        this.startButton.addEventListener('click', () => {
            this.start();
        });
        
        // Durdur butonu
        this.stopButton.addEventListener('click', () => {
            this.stop();
        });
        
        // Enter tuşu ile başlatma
        this.youtubeUrlInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.start();
            }
        });
        
        // Test modu - boş url girilirse
        this.youtubeUrlInput.addEventListener('input', () => {
            if (this.youtubeUrlInput.value.trim() === 'test') {
                CONFIG.simulationMode = true;
                this.updateConnectionStatus('Simülasyon modu hazır', 'connected');
            } else {
                CONFIG.simulationMode = false;
            }
        });
    }
    
    /**
     * Uygulamayı başlat
     */
    async start() {
        if (this.isConnected) {
            return;
        }
        
        const youtubeUrl = this.youtubeUrlInput.value.trim();
        
        // Simülasyon modunu kullanıcı seçimine bırak
        // Eğer bir HTTP sunucusu üzerinden çalıştırılırsa iframe çalışacaktır
        // CONFIG.simulationMode = false;
        
        // Test modu kontrolü
        if (youtubeUrl === 'test' || youtubeUrl === '') {
            this.connectInTestMode();
            return;
        }
        
        // Yine de URL girilmişse göster ama simülasyon modunda çalış
        if (!youtubeUrl) {
            alert('Lütfen bir YouTube yayın linki ya da ID giriniz veya boş bırakarak test modunda çalıştırın.');
            return;
        }
        
        // UI durumunu güncelle
        this.updateUIState(true);
        this.updateConnectionStatus('Bağlanıyor...', 'waiting');
        
        try {
            // Chat bağlantısını başlat
            await this.chatParser.connect(youtubeUrl);
            
            // Bağlantı başarılı
            this.isConnected = true;
            this.updateConnectionStatus('Bağlandı', 'connected');
            
            // Oyunu başlat
            this.game.start();
            
            // Web sayfası başlığını güncelle
            document.title = `SlitherChat.io - ${youtubeUrl}`;
            
        } catch (error) {
            console.error('Bağlantı hatası:', error);
            this.updateConnectionStatus(`Hata: ${error.message}`, 'disconnected');
            this.updateUIState(false);
            
            // Eğer simülasyon aktifse, yine de devam et
            if (CONFIG.simulationMode) {
                this.connectInTestMode();
            } else {
                alert(`Bağlantı hatası: ${error.message}`);
            }
        }
    }
    
    /**
     * Test modunda bağlan (API olmadan)
     */
    connectInTestMode() {
        this.isConnected = true;
        this.updateUIState(true);
        this.updateConnectionStatus('Simülasyon Modu', 'connected');
        
        // Oyunu başlat
        this.game.start();
        
        // Test mesajlarını göndermeye başla
        setInterval(() => {
            // Rastgele bir kullanıcı ve mesaj seç
            const username = CONFIG.simulationUsernames[Math.floor(Math.random() * CONFIG.simulationUsernames.length)];
            const message = CONFIG.simulationMessages[Math.floor(Math.random() * CONFIG.simulationMessages.length)];
            
            // Mesajı işle
            this.onChatMessage({
                id: `sim_${Date.now()}`,
                authorName: username,
                message: message,
                timestamp: new Date().toISOString(),
                authorPhotoUrl: null
            });
        }, 2000); // Her 2 saniyede bir mesaj
    }
    
    /**
     * Uygulamayı durdur
     */
    stop() {
        if (!this.isConnected) {
            return;
        }
        
        // Chat bağlantısını kes
        this.chatParser.disconnect();
        
        // Oyunu durdur
        this.game.stop();
        
        // Durum güncelle
        this.isConnected = false;
        this.updateUIState(false);
        this.updateConnectionStatus('Bağlantı kesildi', 'disconnected');
        
        // Web sayfası başlığını sıfırla
        document.title = 'SlitherChat.io - YouTube Chat Yılan Oyunu';
    }
    
    /**
     * Chat mesajı geldiğinde yapılacaklar
     * @param {Object} message - Mesaj nesnesi
     */
    onChatMessage(message) {
        // Sadece bağlıyken işle
        if (!this.isConnected) {
            return;
        }
        
        // Chat mesaj paneline ekle
        this.addChatMessageToUI(message);
        
        // Kullanıcı için bir yılan oluştur veya güncelle
        this.createOrUpdateSnake(message);
    }
    
    /**
     * Chat mesajını UI'a ekle
     * @param {Object} message - Mesaj nesnesi
     */
    addChatMessageToUI(message) {
        // Maksimum mesaj sayısını kontrol et
        while (this.chatMessages.children.length >= CONFIG.maxChatMessages) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }
        
        // Mesaj elemanı oluştur
        const chatMessageElement = document.createElement('div');
        chatMessageElement.className = 'chat-message';
        
        // Yılan rengini kontrol et veya ata
        if (!this.snakeColors[message.id]) {
            this.snakeColors[message.id] = CONFIG.snakeColors[
                Object.keys(this.snakeColors).length % CONFIG.snakeColors.length
            ];
        }
        
        // Mesaj içeriğini oluştur
        chatMessageElement.innerHTML = `
            <span class="author-name" style="color: ${this.snakeColors[message.id]}">
                ${message.authorName}:
            </span>
            <span class="message-content">${message.message}</span>
        `;
        
        // Mesajı ekle
        this.chatMessages.appendChild(chatMessageElement);
        
        // Otomatik kaydır
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    /**
     * Kullanıcı için yılan oluştur veya güncelle
     * @param {Object} message - Mesaj nesnesi
     */
    createOrUpdateSnake(message) {
        // Kullanıcı ID'sini kontrol et
        const userId = message.id.split('_')[0]; // İlk kısmını al
        
        // Kullanıcı için renk belirle
        let color = this.snakeColors[userId];
        if (!color) {
            // Rastgele bir renk seç
            color = CONFIG.snakeColors[Object.keys(this.snakeColors).length % CONFIG.snakeColors.length];
            this.snakeColors[userId] = color;
        }
        
        // Yılan oluştur veya güncelle
        this.game.addSnake(userId, message.authorName, color);
    }
    
    /**
     * UI bileşenlerinin durumunu güncelle
     * @param {boolean} isConnected - Bağlantı durumu
     */
    updateUIState(isConnected) {
        this.startButton.disabled = isConnected;
        this.stopButton.disabled = !isConnected;
        this.youtubeUrlInput.disabled = isConnected;
    }
    
    /**
     * Bağlantı durum mesajını güncelle
     * @param {string} message - Durum mesajı
     * @param {string} type - Durum türü: 'connected', 'disconnected', 'waiting'
     */
    updateConnectionStatus(message, type) {
        this.connectionStatus.textContent = message;
        this.connectionStatus.className = type || '';
    }
}
