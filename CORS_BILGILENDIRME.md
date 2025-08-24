# YouTube API ve CORS Kısıtlamaları Hakkında Bilgilendirme

## GitHub Pages'teki Kısıtlamalar

SlitherChat.io uygulaması, şu anda GitHub Pages üzerinde simülasyon modunda çalışmaktadır. Bunun nedeni, tarayıcı güvenlik politikaları ve YouTube'un CORS (Cross-Origin Resource Sharing) kısıtlamalarıdır.

### Karşılaşılan Hata:

```
SecurityError: Failed to read a named property 'document' from 'Window': Blocked a frame with origin "https://1sthillman.github.io" from accessing a cross-origin frame.
```

### Neden Bu Hata Oluşuyor?

YouTube, X-Frame-Options: sameorigin başlığı kullanarak iframe içeriğinin yalnızca aynı domain (youtube.com) tarafından erişilebilir olmasını sağlar. Bu, YouTube'un bilinçli bir güvenlik önlemidir ve internet üzerindeki birçok web sitesinde kullanılan standart bir uygulamadır.

## Çözüm Seçenekleri

### 1. Simülasyon Modu (Şu anda aktif)

Uygulama, GitHub Pages'te simülasyon modunda çalışmaktadır. Bu mod, gerçek YouTube chat verilerine erişemez ancak benzer davranışı simüle ederek oyun mekanizmasının deneyimlenmesini sağlar.

### 2. Yerel HTTP Sunucusu Üzerinden Çalıştırma

Eğer gerçek YouTube chat verilerine erişmek istiyorsanız, uygulamayı yerel bir HTTP sunucusu üzerinden çalıştırabilirsiniz:

```bash
# Python ile
cd slither-chat
python -m http.server 8080

# Node.js ile
npm install -g http-server
cd slither-chat
http-server -p 8080
```

Ardından tarayıcınızdan şu adrese gidin: http://localhost:8080

### 3. Backend Proxy İle Geliştirme

Daha kapsamlı bir çözüm için, YouTube API'sini çağıran ve CORS kısıtlamalarını aşan bir backend proxy servisi geliştirilebilir. Bu, Node.js veya Python gibi bir backend teknolojisiyle yapılabilir.

## Sonuç

GitHub Pages üzerinde barındırılan SlitherChat.io, güvenlik kısıtlamaları nedeniyle gerçek YouTube chat verilerine erişemez. Bu nedenle varsayılan olarak simülasyon modunda çalışır ve rastgele oluşturulan mesajları kullanır.

Gerçek chat verileriyle çalışmak istiyorsanız, uygulamayı yerel bir HTTP sunucusu üzerinden çalıştırmanız veya backend proxy çözümü geliştirmeniz gerekmektedir.
