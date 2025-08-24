/**
 * SlitherChat.io - Oyun Sınıfı
 */

class Game {
    /**
     * Yeni bir oyun oluştur
     * @param {HTMLCanvasElement} canvas - Oyun canvası
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // Oyun elemanları
        this.snakes = [];
        this.foods = [];
        this.boundaries = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Oyun durumu
        this.running = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
    }
    
    /**
     * Canvas boyutunu pencere boyutuna ayarla
     */
    resize() {
        const gameArea = this.canvas.parentElement;
        this.canvas.width = gameArea.clientWidth;
        this.canvas.height = gameArea.clientHeight;
        
        // Sınırları güncelle
        this.boundaries = {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    /**
     * Oyunu başlat
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastFrameTime = performance.now();
        
        // Başlangıç yemlerini ekle
        this.addInitialFood();
        
        // Oyun döngüsünü başlat
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        // Overlay'i gizle
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    /**
     * Oyunu durdur
     */
    stop() {
        this.running = false;
        
        // Overlay'i göster
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    /**
     * Başlangıç yemlerini ekle
     */
    addInitialFood() {
        const initialFoodCount = Math.min(30, CONFIG.maxFood);
        
        for (let i = 0; i < initialFoodCount; i++) {
            this.foods.push(Food.createRandom(this.boundaries));
        }
    }
    
    /**
     * Yeni bir yem ekle
     */
    addFood() {
        if (this.foods.length >= CONFIG.maxFood) return;
        
        // CONFIG.foodSpawnRate olasılıkla yeni yem ekle
        if (Math.random() < CONFIG.foodSpawnRate) {
            this.foods.push(Food.createRandom(this.boundaries));
        }
    }
    
    /**
     * Yeni bir yılan ekle
     * @param {string} id - Yılan ID'si
     * @param {string} name - Yılan ismi
     * @param {string} color - Yılan rengi (opsiyonel)
     */
    addSnake(id, name, color) {
        // Yılan zaten var mı?
        const existingSnake = this.snakes.find(snake => snake.id === id);
        if (existingSnake) {
            // Eğer ölmüşse canlandır
            if (!existingSnake.alive) {
                // Rastgele bir konum seç
                const x = Math.random() * (this.boundaries.width - 100) + 50;
                const y = Math.random() * (this.boundaries.height - 100) + 50;
                
                // Yeni yılan oluştur
                const newSnake = new Snake(id, name, x, y, color);
                
                // Eski yılanı kaldır ve yenisini ekle
                this.snakes = this.snakes.filter(snake => snake.id !== id);
                this.snakes.push(newSnake);
            }
            return;
        }
        
        // Rastgele bir konum seç
        const x = Math.random() * (this.boundaries.width - 100) + 50;
        const y = Math.random() * (this.boundaries.height - 100) + 50;
        
        // Yeni yılan oluştur
        const snake = new Snake(id, name, x, y, color);
        this.snakes.push(snake);
        
        return snake;
    }
    
    /**
     * Ana oyun döngüsü
     * @param {number} timestamp - Mevcut zaman
     */
    gameLoop(timestamp) {
        if (!this.running) return;
        
        // Delta time hesapla (saniye cinsinden)
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        this.frameCount++;
        
        // Ekranı temizle
        this.ctx.fillStyle = CONFIG.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Izgara çiz
        this.drawGrid();
        
        // Yemekleri güncelle ve çiz
        for (const food of this.foods) {
            food.update();
            food.draw(this.ctx);
        }
        
        // Yeni yemler ekle
        this.addFood();
        
        // Yılanları güncelle ve çiz
        for (const snake of this.snakes) {
            // Sadece canlı yılanları güncelle
            if (snake.alive) {
                snake.update(this.foods, this.snakes, this.boundaries);
            }
            
            snake.draw(this.ctx);
        }
        
        // Leaderboard güncelle
        if (this.frameCount % 60 === 0) {
            this.updateLeaderboard();
        }
        
        // Bir sonraki kareyi talep et
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    /**
     * Izgara çiz
     */
    drawGrid() {
        const gridSize = CONFIG.gridSize;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = CONFIG.gridColor;
        this.ctx.lineWidth = 1;
        
        // Yatay çizgiler
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        
        // Dikey çizgiler
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Leaderboard'u güncelle
     */
    updateLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboardBody');
        if (!leaderboardBody) return;
        
        // Skor tablosunu temizle
        leaderboardBody.innerHTML = '';
        
        // Yılanları puana göre sırala
        const sortedSnakes = [...this.snakes].sort((a, b) => b.score - a.score);
        
        // En fazla 10 yılan göster
        for (let i = 0; i < Math.min(sortedSnakes.length, CONFIG.maxLeaderboardEntries); i++) {
            const snake = sortedSnakes[i];
            
            // Satır oluştur
            const row = document.createElement('tr');
            
            // Sıra
            const rankCell = document.createElement('td');
            rankCell.textContent = i + 1;
            row.appendChild(rankCell);
            
            // İsim
            const nameCell = document.createElement('td');
            nameCell.textContent = snake.name;
            nameCell.style.color = snake.color;
            row.appendChild(nameCell);
            
            // Puan
            const scoreCell = document.createElement('td');
            scoreCell.textContent = snake.score;
            row.appendChild(scoreCell);
            
            // Satırı tabloya ekle
            leaderboardBody.appendChild(row);
        }
        
        // Oyuncu sayısını güncelle
        document.getElementById('playerCount').textContent = `Yılanlar: ${this.snakes.filter(s => s.alive).length}`;
    }
}
