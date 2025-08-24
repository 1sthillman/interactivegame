# SlitherChat.io Kurulum Kılavuzu

Bu kılavuz, SlitherChat.io uygulamasının kurulumu ve kullanımı için adım adım talimatları içerir.

## Gereksinimler

- Node.js (12.x veya daha yeni)
- npm (Node.js ile birlikte gelir)
- Aktif bir YouTube canlı yayını

## Kurulum Adımları

1. **Repoyu indirin**
   ```bash
   git clone https://github.com/1sthillman/interactivegame.git
   cd interactivegame
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Sunucuyu başlatın**
   ```bash
   npm start
   ```

4. **Tarayıcınızdan erişin**
   
   Tarayıcınızda http://localhost:3000 adresine gidin.

## Oyunu Kullanma

1. YouTube canlı yayın URL'sini veya video ID'sini giriş kutusuna yazın
2. "Başlat" düğmesine tıklayın
3. Chat'e mesaj yazanlar otomatik olarak yılan olarak ekrana gelecek
4. Yılanlar yem toplayarak ve diğer yılanları yiyerek büyüyecekler
5. Lider tablosunda en büyük yılanlar gösterilecek

## Sorun Giderme

### Mesajlar Görünmüyor

- Canlı yayın aktif olduğundan emin olun
- Video ID'nin doğru olduğunu kontrol edin
- Tarayıcı konsolunda hata olup olmadığını kontrol edin (F12)

### Bağlantı Hatası

- Sunucunun çalıştığından emin olun (http://localhost:3000)
- API anahtarının geçerli olduğunu kontrol edin
- YouTube API kotalarını aşmış olabilirsiniz

### CORS Hataları

- Uygulamayı Node.js backend üzerinden çalıştırdığınızdan emin olun
- Doğrudan HTML dosyasını açmak yerine http://localhost:3000 adresini kullanın

## Gelişmiş Ayarlar

### API Anahtarı Değiştirme

API anahtarını değiştirmek için `server.js` dosyasında şu satırı güncelleyin:

```javascript
const API_KEY = 'YENİ_API_ANAHTARINIZ';
```

### Sunucu Portunu Değiştirme

Varsayılan port 3000'dir. Değiştirmek için:

```javascript
const port = process.env.PORT || 3000; // 3000 yerine istediğiniz portu yazın
```

### Oyun Ayarlarını Değiştirme

Yılan hızı, yem miktarı gibi ayarları değiştirmek için `js/config.js` dosyasını düzenleyebilirsiniz.
