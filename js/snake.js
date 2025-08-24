/**
 * SlitherChat.io - Yılan Sınıfı
 */

class Snake {
    /**
     * Yeni bir yılan oluştur
     * @param {string} id - Yılan ID'si
     * @param {string} name - Yılanın ismi
     * @param {number} x - Başlangıç X konumu
     * @param {number} y - Başlangıç Y konumu
     * @param {string} color - Yılanın rengi
     */
    constructor(id, name, x, y, color) {
        this.id = id;
        this.name = name;
        
        // Konum ve fizik
        this.segments = [];
        this.initialSize = CONFIG.initialSnakeSize;
        this.headX = x;
        this.headY = y;
        this.angle = Math.random() * Math.PI * 2; // Rastgele yön
        this.targetAngle = this.angle;
        this.speed = CONFIG.snakeSpeed;
        this.turnSpeed = CONFIG.turnSpeed;
        
        // Görsel özellikler
        this.color = color || this.getRandomColor();
        this.radius = 10; // Yılan kafa çapı
        this.segments = [];
        
        // Oyun mekaniği
        this.score = 0;
        this.alive = true;
        this.lastUpdate = Date.now();
        
        // Başlangıç segmentlerini ekle
        for (let i = 0; i < this.initialSize; i++) {
            this.segments.push({
                x: this.headX - Math.cos(this.angle) * i * (this.radius * 2) * 0.9,
                y: this.headY - Math.sin(this.angle) * i * (this.radius * 2) * 0.9,
                radius: this.radius - (i * 0.05)
            });
        }
    }
    
    /**
     * Rastgele bir renk seç
     */
    getRandomColor() {
        return CONFIG.snakeColors[Math.floor(Math.random() * CONFIG.snakeColors.length)];
    }
    
    /**
     * Yılanı güncelle
     * @param {Array} foods - Haritadaki tüm yemler
     * @param {Array} snakes - Haritadaki diğer yılanlar
     * @param {Object} boundaries - Harita sınırları
     */
    update(foods, snakes, boundaries) {
        if (!this.alive) return;
        
        const now = Date.now();
        const dt = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
        
        // Yönü yumuşak bir şekilde değiştir
        if (this.angle !== this.targetAngle) {
            // Saat yönünde mi yoksa saat yönünün tersine mi dönmek daha kısa?
            const angleDiff = (this.targetAngle - this.angle + Math.PI * 3) % (Math.PI * 2) - Math.PI;
            this.angle += angleDiff * this.turnSpeed * dt * 3;
            
            // Tam 2π'ye normalize et
            this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);
        }
        
        // AI kontrolü - her AI güncellemesinde hedef açıyı belirle
        if (now - this.lastAIUpdate > CONFIG.aiUpdateInterval) {
            this.updateAI(foods, snakes, boundaries);
            this.lastAIUpdate = now;
        }
        
        // Başı hareket ettir
        this.headX += Math.cos(this.angle) * this.speed;
        this.headY += Math.sin(this.angle) * this.speed;
        
        // Harita sınırlarını kontrol et
        if (this.headX < this.radius) {
            this.headX = this.radius;
            this.targetAngle = Math.PI - this.targetAngle;
        } else if (this.headX > boundaries.width - this.radius) {
            this.headX = boundaries.width - this.radius;
            this.targetAngle = Math.PI - this.targetAngle;
        }
        
        if (this.headY < this.radius) {
            this.headY = this.radius;
            this.targetAngle = -this.targetAngle;
        } else if (this.headY > boundaries.height - this.radius) {
            this.headY = boundaries.height - this.radius;
            this.targetAngle = -this.targetAngle;
        }
        
        // İlk segmenti başa güncelle
        this.segments[0] = {
            x: this.headX,
            y: this.headY,
            radius: this.radius
        };
        
        // Diğer segmentleri güncelle
        for (let i = this.segments.length - 1; i > 0; i--) {
            // Takip etme hareketi: her segment bir öncekini takip eder
            const prevSegment = this.segments[i-1];
            const segment = this.segments[i];
            
            // Aralarındaki mesafeyi hesapla
            const dx = prevSegment.x - segment.x;
            const dy = prevSegment.y - segment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // İdeal mesafe, segmentin çapının 1.8 katı
            const idealDistance = (prevSegment.radius + segment.radius) * 0.9;
            
            // Çok uzaksa, birbirine yaklaştır
            if (distance > idealDistance) {
                segment.x += (dx / distance) * (distance - idealDistance) * 0.2;
                segment.y += (dy / distance) * (distance - idealDistance) * 0.2;
            }
        }
        
        // Yem kontrolü
        this.checkFoodCollisions(foods);
        
        // Çarpışma kontrolü
        this.checkCollisions(snakes);
    }
    
    /**
     * Yapay zeka kontrolü
     * @param {Array} foods - Haritadaki tüm yemler
     * @param {Array} snakes - Haritadaki diğer yılanlar
     * @param {Object} boundaries - Harita sınırları
     */
    updateAI(foods, snakes, boundaries) {
        const visionRange = CONFIG.visionRange;
        let targetFood = null;
        let minFoodDistance = Infinity;
        
        // En yakın yemi bul
        for (const food of foods) {
            const dx = food.x - this.headX;
            const dy = food.y - this.headY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minFoodDistance && distance < visionRange) {
                minFoodDistance = distance;
                targetFood = food;
            }
        }
        
        // Tehlikeli yılanları kontrol et ve kaçın
        let danger = { x: 0, y: 0, weight: 0 };
        for (const snake of snakes) {
            if (snake.id === this.id || !snake.alive) continue;
            
            // Sadece baş kısmı tehlikelidir
            const dx = snake.segments[0].x - this.headX;
            const dy = snake.segments[0].y - this.headY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Tehlike mesafesinde ise, kaç
            if (distance < visionRange / 2) {
                const weight = 1 - (distance / visionRange);
                danger.x -= dx * weight;
                danger.y -= dy * weight;
                danger.weight += weight;
            }
        }
        
        // Sınırlara yakınsa kaçın
        const borderMargin = visionRange / 3;
        if (this.headX < borderMargin) {
            danger.x += (borderMargin - this.headX) * 0.5;
            danger.weight += 0.5;
        } else if (this.headX > boundaries.width - borderMargin) {
            danger.x -= (this.headX - (boundaries.width - borderMargin)) * 0.5;
            danger.weight += 0.5;
        }
        
        if (this.headY < borderMargin) {
            danger.y += (borderMargin - this.headY) * 0.5;
            danger.weight += 0.5;
        } else if (this.headY > boundaries.height - borderMargin) {
            danger.y -= (this.headY - (boundaries.height - borderMargin)) * 0.5;
            danger.weight += 0.5;
        }
        
        // Hedef açıyı belirle
        if (danger.weight > 0.1) {
            // Tehlikeden kaç
            this.targetAngle = Math.atan2(danger.y, danger.x);
        } else if (targetFood) {
            // Yeme doğru git
            this.targetAngle = Math.atan2(targetFood.y - this.headY, targetFood.x - this.headX);
        } else {
            // Rastgele hafif sapma
            this.targetAngle += (Math.random() - 0.5) * 0.2;
        }
    }
    
    /**
     * Yemlerle çarpışma kontrolü
     * @param {Array} foods - Haritadaki tüm yemler
     */
    checkFoodCollisions(foods) {
        const head = this.segments[0];
        const headRadius = head.radius;
        
        for (let i = foods.length - 1; i >= 0; i--) {
            const food = foods[i];
            const dx = food.x - head.x;
            const dy = food.y - head.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Eğer yılanın başı yeme değiyorsa
            if (distance < headRadius + food.radius) {
                // Yemi sil
                foods.splice(i, 1);
                
                // Yılanın puanını ve boyutunu artır
                this.score += food.value;
                this.addSegment();
            }
        }
    }
    
    /**
     * Diğer yılanlarla çarpışma kontrolü
     * @param {Array} snakes - Haritadaki diğer yılanlar
     */
    checkCollisions(snakes) {
        if (!this.alive) return;
        
        const head = this.segments[0];
        
        // Diğer yılanların segmentleriyle çarpışma kontrolü
        for (const snake of snakes) {
            // Kendini kontrol etme
            if (snake.id === this.id) continue;
            if (!snake.alive) continue;
            
            // Diğer yılanın her segmentiyle karşılaştır
            for (let i = 0; i < snake.segments.length; i++) {
                const segment = snake.segments[i];
                const dx = segment.x - head.x;
                const dy = segment.y - head.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Eğer çarpıştıysa
                if (distance < head.radius + segment.radius * 0.8) {
                    // Eğer başka bir yılanın başına çarptıysak ve bizim yılanımız daha büyükse, onu ye
                    if (i === 0 && this.segments.length > snake.segments.length) {
                        snake.die();
                        this.score += snake.segments.length;
                        // Her segment için yeni segment ekle
                        for (let j = 0; j < snake.segments.length; j++) {
                            this.addSegment();
                        }
                    } else {
                        // Aksi takdirde ölürüz
                        this.die();
                    }
                    return;
                }
            }
        }
        
        // Kendi segmentlerimizle çarpışma kontrolü (kafa gövdeye değerse)
        for (let i = 2; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const dx = segment.x - head.x;
            const dy = segment.y - head.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Eğer kafa kendi gövdesine çarparsa
            if (distance < head.radius + segment.radius * 0.8) {
                this.die();
                return;
            }
        }
    }
    
    /**
     * Yeni segment ekle
     */
    addSegment() {
        const lastSegment = this.segments[this.segments.length - 1];
        const secondLastSegment = this.segments[this.segments.length - 2];
        
        // Son iki segmentin yönünü hesapla
        const dx = lastSegment.x - secondLastSegment.x;
        const dy = lastSegment.y - secondLastSegment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Yeni segment ekle
        this.segments.push({
            x: lastSegment.x + (dx / distance) * lastSegment.radius * 2,
            y: lastSegment.y + (dy / distance) * lastSegment.radius * 2,
            radius: Math.max(2, lastSegment.radius - 0.05)
        });
    }
    
    /**
     * Yılan ölüm fonksiyonu
     */
    die() {
        this.alive = false;
    }
    
    /**
     * Yılanı çiz
     * @param {CanvasRenderingContext2D} ctx - Canvas contexti
     */
    draw(ctx) {
        if (!this.alive) return;
        
        // Gövdeyi çiz (sondan başa doğru)
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Segment konturu (sadece baş kısmı)
            if (i === 0) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Gözleri çiz
                const eyeRadius = segment.radius * 0.3;
                const eyeOffsetX = Math.cos(this.angle) * segment.radius * 0.5;
                const eyeOffsetY = Math.sin(this.angle) * segment.radius * 0.5;
                
                // Sol göz
                ctx.beginPath();
                ctx.arc(
                    segment.x + eyeOffsetX + Math.cos(this.angle + Math.PI/2) * eyeRadius * 1.2,
                    segment.y + eyeOffsetY + Math.sin(this.angle + Math.PI/2) * eyeRadius * 1.2,
                    eyeRadius, 0, Math.PI * 2
                );
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                // Sağ göz
                ctx.beginPath();
                ctx.arc(
                    segment.x + eyeOffsetX + Math.cos(this.angle - Math.PI/2) * eyeRadius * 1.2,
                    segment.y + eyeOffsetY + Math.sin(this.angle - Math.PI/2) * eyeRadius * 1.2,
                    eyeRadius, 0, Math.PI * 2
                );
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }
        
        // İsmi çiz
        const head = this.segments[0];
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.name, head.x, head.y - head.radius - 10);
    }
}
