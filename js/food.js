/**
 * SlitherChat.io - Yem Sınıfı
 */

class Food {
    /**
     * Yeni bir yem oluştur
     * @param {number} x - X koordinatı
     * @param {number} y - Y koordinatı
     * @param {number} value - Yem değeri (puan)
     * @param {number} radius - Yem boyutu
     * @param {string} color - Yem rengi
     */
    constructor(x, y, value, radius, color) {
        this.x = x;
        this.y = y;
        this.value = value || 1;
        this.radius = radius || CONFIG.foodSize;
        this.color = color || this.getRandomColor();
        this.pulse = 0;
        this.pulseDirection = 1;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
    }
    
    /**
     * Rastgele bir renk seç
     */
    getRandomColor() {
        return CONFIG.foodColors[Math.floor(Math.random() * CONFIG.foodColors.length)];
    }
    
    /**
     * Yemi güncelle (yanıp sönme efekti için)
     */
    update() {
        // Yanıp sönme efekti
        this.pulse += this.pulseDirection * this.pulseSpeed;
        
        if (this.pulse > 1) {
            this.pulse = 1;
            this.pulseDirection = -1;
        } else if (this.pulse < 0) {
            this.pulse = 0;
            this.pulseDirection = 1;
        }
    }
    
    /**
     * Yemi çiz
     * @param {CanvasRenderingContext2D} ctx - Canvas contexti
     */
    draw(ctx) {
        // Yanıp sönme efekti için boyut hesapla
        const pulseRadius = this.radius * (1 + this.pulse * 0.2);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Parlama efekti
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Rastgele bir yem oluştur
     * @param {Object} boundaries - Harita sınırları
     */
    static createRandom(boundaries) {
        // Kenarlardan biraz içeride olsun
        const margin = 20;
        const x = Math.random() * (boundaries.width - margin * 2) + margin;
        const y = Math.random() * (boundaries.height - margin * 2) + margin;
        
        // Değer ve büyüklük
        const value = Math.floor(Math.random() * 3) + 1;
        const radius = CONFIG.foodSize * (0.8 + value * 0.2);
        
        return new Food(x, y, value, radius);
    }
}
