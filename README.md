# ⚽ Football Kids Quiz

Çocuklar için futbolcu tanıma oyunu. React Native (Expo) ile yazılmıştır, tamamen çevrimdışı çalışır ve hiçbir veri toplamaz.

## Özellikler

- İki oyun: **Kim Bu?** (fotoğrafa bak, ismi bul) ve **Hangisi?** (ismi dinle, fotoğrafı bul)
- Üç seviye: Kolay (2 seçenek), Orta (4 seçenek), Zor (4 seçenek + 10 saniye süre)
- Her oyun 10 soru; 25 futbolculuk havuz (5 Türk futbolcu dahil)
- Yıldızlar, seviyeler (Çaylak → Efsane), rekorlar ve toplanabilir futbolcu albümü
- Ses efektleri, titreşim ve isimlerin kendi dilindeki sesle okunması
- Türkçe / İngilizce arayüz
- İlerleme ve ayarlar cihazda saklanır
- Ayarlar ve tüm dış bağlantılar iki adımlı ebeveyn kapısının arkasındadır
- Hiçbir cihaz izni istemez (mikrofon, kamera, konum yok)

## Proje Yapısı

| Yol | İçerik |
|---|---|
| `App.js` | Ekranlar arası geçiş, kayıtlı durum, diyaloglar |
| `src/screens/` | Ana sayfa, oyun, sonuç ve albüm ekranları |
| `src/components.js` | Ortak arayüz parçaları (düğme, arka plan, konfeti) |
| `src/modals.js` | Ayarlar, görsel kaynakları, ebeveyn kapısı |
| `src/game.js` | Soru üretimi, seviyeler, yıldız ve rütbe kuralları |
| `src/players.js` | Futbolcu listesi |
| `src/i18n.js` | Çeviriler |
| `src/sound.js` | Ses efektleri, titreşim, seslendirme |
| `src/sfx.ios.js`, `src/sfx.js` | Ses efekti altyapısı: iOS'ta yerel `KidsSound` modülü, Android'de `expo-audio` |
| `modules/kids-sound/` | iOS için yalnızca ses çalan yerel modül (mikrofon/kayıt kodu içermez) |
| `src/storage.js` | Cihazda kalıcı kayıt |
| `src/theme.js` | Renkler ve yazı tipi |

## Çalıştırma

Node.js kurulu olmalı. Uygulama native modüller kullandığı için Expo Go yerine geliştirme derlemesiyle çalışır.

```bash
npm install
cd ios && pod install && cd ..
npm run ios
```

## İçerik Güncelleme

```bash
# Futbolcu fotoğraflarını ve lisans bilgilerini Wikimedia'dan yeniler (ffmpeg gerekir)
node scripts/refresh_player_images_from_wikimedia.mjs

# Ses efektlerini yeniden üretir
node scripts/generate_sounds.mjs
```

Fotoğraflar 3:4 oranında kırpılır; yeniledikten sonra yüzlerin kadrajda kaldığını gözle kontrol et (Arda Güler'in fotoğrafı elle, en üstten kırpılmıştır; betik yeniden çalışırsa tekrar düzeltilmesi gerekir). Yeni futbolcu eklemek için `src/players.js` ve yenileme betiğindeki listeyi birlikte güncelle.

## App Store Build ve Submit (EAS)

```bash
npx eas login
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

Ayrıntılar için `APP_STORE_RELEASE_CHECKLIST.md` dosyasına bak. Sürüm 1.1'in mağaza metinleri ve ekran görüntüleri `store/v1.1/`, web sayfaları `docs/v1.1/` altındadır. Sürüm 1.0 `v1.0` etiketiyle saklanır.

## Not

Fotoğraflar Wikimedia Commons'tan CC lisanslarıyla alınmıştır ve kaynakları uygulama içinde gösterilir. Bu lisanslar telif hakkını kapsar; futbolcuların isim ve görüntü haklarını kapsamaz. Yayından önce bu konuyu ayrıca değerlendir.
