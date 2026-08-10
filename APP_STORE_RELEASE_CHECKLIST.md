# App Store Release Checklist (Futbol Kids Quiz)

## 1) Apple ve App Store Connect

- [ ] Apple Developer hesabı aktif
- [ ] App Store Connect'te yeni app oluşturuldu
- [ ] Bundle ID: `com.serhatonal.footballkidsquiz`
- [ ] App adı, alt başlık, kategori, yaş derecelendirmesi tamamlandı

## 2) Proje Ayarları

- [ ] `app.json` içindeki `expo.version` bu release için güncellendi (örn. `1.0.1`)
- [ ] `app.json` içindeki `expo.ios.buildNumber` artırıldı (örn. `2`, `3`, ...)
- [ ] `assets/icon.png` son icon
- [ ] Gizlilik politikası URL hazır

## 3) İçerik ve Uyum

- [ ] Kullanılan futbolcu görsellerinin lisans/hak kontrolü yapıldı
- [ ] Çocuk uygulaması kurallarına göre veri toplama ve takip ayarları doğrulandı
- [ ] Uygulama metinleri son kontrol (TR/EN)

## 4) Build ve Submit Komutları

```bash
npm install
npm run start
npx eas login
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

## 5) TestFlight

- [ ] Build App Store Connect'te "Processing" tamamlandı
- [ ] Internal tester'lara dağıtıldı
- [ ] Fiziksel iPhone testleri tamamlandı (açılış, oyun turu, seslendirme)

## 6) Review Öncesi Son Kontrol

- [ ] App Privacy bölümü dolduruldu
- [ ] Export Compliance (encryption) soruları kontrol edildi
- [ ] Ekran görüntüleri ve açıklama final
- [ ] Submit for Review

## Hızlı Notlar

- `eas.json` içinde `submit.production.ios.ascAppId` alanını App Store Connect App ID ile doldur.
- Team bazlı imza sorunlarında `submit.production.ios.appleTeamId` alanını doldur.
- Her yeni gönderimde `buildNumber` artırmayı unutma.
