# SlitherChat.io - Gerçek YouTube Chat Yılan Oyunu

Bu uygulama, YouTube canlı yayın chat mesajlarını gerçek zamanlı olarak takip ederek, her mesaj yazanı bir yılan olarak gösteren slither.io benzeri bir oyundur. 

## GERÇEK CHAT VERİLERİ İÇİN BACKEND GEREKLİDİR

Bu projede YouTube chat verilerini çekmek için bir Node.js backend API kullanılır. Bu, tarayıcı güvenlik kısıtlamalarını (CORS) aşmanın en güvenli ve etkili yoludur.

## Kurulum

1. Gereksinimleri yükleyin:
   ```bash
   npm install
   ```

2. Sunucuyu başlatın:
   ```bash
   npm start
   ```

3. Tarayıcınızda şu adresi ziyaret edin: http://localhost:3000

## Nasıl Çalışır?

1. Bir YouTube canlı yayın URL'si veya Video ID'si girin
2. "Başlat" butonuna tıklayın
3. Chat mesajları gelmeye başladığında, her mesaj yazan bir yılan olarak ekranda görünecek
4. Yılanlar otomatik olarak hareket edip yem toplayacak ve birbirleriyle etkileşime girecek

## Backend API Detayları

Node.js backend API, iki ana endpoint sunar:

- `/api/video/:videoId` - Video bilgilerini ve canlı yayın chat ID'sini alır
- `/api/chat/:videoId` - Canlı yayın chat mesajlarını alır

Bu backend API, YouTube Data API v3'ü kullanarak canlı yayın chat verilerini çeker.

## CORS Sorununu Çözme

Backend proxy yaklaşımı, YouTube'un iframe ve JavaScript kısıtlamalarını aşmak için en etkili çözümdür. Bu yöntem sayesinde:

1. YouTube API istekleri sunucu tarafından yapılır
2. Tarayıcı güvenlik kısıtlamaları (CORS) aşılır
3. API anahtarı güvenli bir şekilde saklanabilir
4. Rate-limiting ve önbellek stratejileri uygulanabilir

## Geliştirme

- `server.js` - Node.js backend API
- `js/chat-parser.js` - Backend API ile iletişim kurma ve mesajları işleme
- `js/app.js` - Ana uygulama mantığı
- `js/snake.js` ve `js/food.js` - Oyun nesneleri
- `js/game.js` - Oyun mekanikleri ve render döngüsü

## Güvenlik Notları

- Bu uygulama Node.js backend gerektirdiğinden, GitHub Pages üzerinde tam işlevsellikle çalıştırılamaz
- Uygulamayı kendi sunucunuzda barındırırken, API anahtarını .env dosyasına taşımanızı öneririz