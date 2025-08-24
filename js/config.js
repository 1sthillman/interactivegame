/**
 * SlitherChat.io - Yapılandırma Dosyası
 */

const CONFIG = {
    // Oyun ayarları
    gameSpeed: 60, // FPS
    backgroundColor: '#0a0a0a',
    gridColor: '#1a1a1a',
    gridSize: 20, // Grid boyutu
    chatCheckInterval: 1000, // Chat kontrolü sıklığı (ms)
    
    // Yılan ayarları
    initialSnakeSize: 5, // Başlangıç yılan boyutu
    snakeColors: [
        '#4CAF50', // Yeşil
        '#2196F3', // Mavi
        '#f44336', // Kırmızı
        '#FF9800', // Turuncu
        '#9C27B0', // Mor
        '#FFEB3B', // Sarı
        '#00BCD4', // Açık Mavi
        '#FF5722'  // Turuncu Kırmızı
    ],
    snakeSpeed: 3, // Yılan hareket hızı
    turnSpeed: 0.1, // Dönüş hızı
    visionRange: 200, // Yılanın görebildiği mesafe
    aiUpdateInterval: 500, // AI güncelleme hızı (ms)
    
    // Yem ayarları
    foodColors: ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
    maxFood: 100, // Haritada maksimum yem sayısı
    foodSpawnRate: 0.1, // Her karede yem üretme olasılığı
    foodSize: 5, // Yem boyutu
    
    // Chat ayarları
    maxChatMessages: 50, // Gösterilen maksimum mesaj sayısı
    maxLeaderboardEntries: 10, // Liderlik tablosunda gösterilecek maksimum oyuncu
    
    // Simülasyon ayarları
    simulationMode: false, // Gerçek chat bağlantısı yoksa simülasyon modu
    simulationMessages: [ // Simülasyon mesajları
        "Merhaba dünya!",
        "SlitherChat.io çok eğlenceli!",
        "Ben de oynamak istiyorum!",
        "Yeşil yılan benim!",
        "Kırmızı yılanlar hızlı!",
        "Bu oyun harika!",
        "Yılanlara dikkat edin!",
        "Çok büyüdüm!",
        "Yem toplama zamanı!",
        "Diğer yılanlardan kaçın!",
        "Lider tablosuna girmek istiyorum!"
    ],
    simulationUsernames: [ // Simülasyon kullanıcı adları
        "Oyuncu1", "CoolGamer", "SnakeHunter", "YılanUstası", "Gezgin123",
        "HızlıYılan", "OyunSever", "Avcı555", "YemToplayıcı", "KralYılan",
        "Taktikci", "HızlıGezgin", "YılanKral", "SüperOyuncu", "MaviBoncuk"
    ],
    simulationChatInterval: [1000, 3000], // Simülasyon mesaj aralığı (min, max ms)
};
