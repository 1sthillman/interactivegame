# SlitherChat.io - YouTube Chat Snake Oyunu

Bu uygulama, YouTube canlı yayın sohbetlerini simüle ederek sohbete yazanların her birini bir yılan olarak oyunda gösteren bir slither.io benzeri oyundur.

## Özellikler

- Slither.io benzeri oyun mekanizması
- Her chat mesajı yazan bir yılan olarak ekrana gelir
- Yılanlar yem toplayarak ve diğer yılanları yiyerek büyüyebilir
- Gerçek zamanlı skor tablosu ve chat paneli

## CORS Kısıtlamaları Hakkında

YouTube, güvenlik nedeniyle X-Frame-Options: sameorigin ayarıyla iframe içinde kullanımı kısıtlamaktadır. Bu nedenle, doğrudan tarayıcıdan açıldığında gerçek chat verilerine erişemeyiz.

Bu sorunu çözmek için:

1. Uygulama varsayılan olarak simülasyon modunda çalışır
2. Gerçek YouTube chat verilerine erişim için bir web sunucusu ve proxy gereklidir
3. Lokal geliştirmede Python veya Node.js gibi basit bir web sunucusu kullanabilirsiniz

## Nasıl Çalışır?

1. Uygulamayı açın
2. YouTube video ID'si girin veya boş bırakıp "Başlat" butonuna tıklayın
3. Simülasyon modunda rastgele chat mesajları ve yılanlar oluşacaktır
4. Her yılan otomatik olarak hareket edecek ve yem toplayacaktır
5. Büyük yılanlar küçük yılanları yiyebilir

## Kurulum

Bu uygulama saf JavaScript, HTML ve CSS kullanılarak geliştirilmiştir. Ek kütüphane veya framework gerekmez.

### Lokal Web Sunucusu İle Çalıştırma:

```
# Python ile
cd slither-chat
python -m http.server

# Node.js ile
npm install -g http-server
cd slither-chat
http-server
```

## Geliştiriciler İçin

CORS kısıtlamalarını aşmak için bir backend proxy oluşturulabilir. Bu durumda `chat-parser.js` dosyasında gerekli değişiklikleri yaparak YouTube API erişimini doğrudan sağlayabilirsiniz.
