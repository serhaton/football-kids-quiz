# App Store Release Checklist (Football Kids Quiz)

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
- [ ] Kids Category parental gate doğrulandı (uygulama dışına çıkıştan önce zorunlu)
- [ ] Uygulama metinleri son kontrol (TR/EN)

### Kids Category Reviewer Notu (Guideline 1.3)

- Uygulama içindeki dış bağlantılar (Image Credits altındaki Source/License linkleri) parental gate arkasına alındı.
- Parental gate iki adımlı ve zorunlu:
	1) 2 saniye basılı tutma
	2) Rastgele matematik sorusu çözme
- Doğrulama tamamlanmadan dış bağlantı açılmaz.
- Gate ayarlardan kapatılamaz (disable edilemez).
- Kod referansı: `App.js` içinde `openExternalLink`, `parentalGateModal`, `completeParentalGate`.

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
