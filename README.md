# ⚽ Futbolcuyu Bul!

Çocuklar için hazırlanmış futbolcu tahmin oyununun React Native (Expo) sürümü.

## Teknoloji

- React Native
- Expo
- iOS bundle id: `com.serhatonal.footballkidsquiz`

## Geliştirme İçin Çalıştırma

Node.js kurulu olmalı.

```bash
npm install
npm run start
```

Uygulamayı Expo Go veya iOS Simulator ile açabilirsin.

## iOS'ta Native Çalıştırma

```bash
npm run ios
```

Bu komut iOS projesini üretir ve Simulator'da başlatır.

## App Store Build ve Submit (EAS)

1. Expo hesabı oluştur ve giriş yap:

```bash
npx eas login
```

2. İlk kez yapılandır:

```bash
npx eas build:configure
```

3. Production iOS build al:

```bash
npx eas build --platform ios --profile production
```

4. Build tamamlanınca App Store Connect'e gönder:

```bash
npx eas submit --platform ios --profile production
```

## Özellikler

- 10 soruluk oyun
- 25 futbolcu havuzu (5 Türk futbolcu dahil)
- Her oyunda 10 farklı futbolcu sorulur
- Büyük fotoğraflar
- Cevap seçenekleri
- 🔊 Expo Speech ile isimleri seslendirme
- Skor
- Doğru/yanlış görsel geri bildirim
- iOS uyumlu native arayüz

## Not

Futbolcu görselleri artık yerel `assets/players` klasöründen yüklenir ve uygulama oyun sırasında internet bağlantısına ihtiyaç duymaz.

App Store yayınından önce görseller için lisans/hak kontrolünü yine yapman önerilir.

Bir sonraki aşamada:
- Türkçe çocuk sesi
- Futbol topu animasyonları
- Kolay/orta/zor seviyeleri
- Favori futbolcular
- Ebeveyn ayarları
eklenebilir.
