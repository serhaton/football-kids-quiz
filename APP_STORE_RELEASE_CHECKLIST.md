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

- Ayarlar ekranı her zaman parental gate arkasındadır (dil, ses, albümü sıfırlama, gizlilik politikası, görsel kaynakları).
- Uygulamadan dışarı çıkan her bağlantı (Gizlilik Politikası, Image Credits altındaki Source/License linkleri) ayrıca parental gate ister.
- Parental gate iki adımlı ve zorunlu:
	1) 2 saniye basılı tutma
	2) Rastgele matematik sorusu çözme
- Doğrulama tamamlanmadan ayarlar açılmaz, dış bağlantı açılmaz.
- Gate kapatılamaz (disable edilemez).
- Uygulama reklam, analitik, hesap, satın alma içermez; internet bağlantısı kullanmaz ve veri toplamaz. İlerleme yalnızca cihazda saklanır.
- Uygulama mikrofon, kamera, konum veya başka bir izin istemez. iOS sürümünde ses efektleri yalnızca `AVAudioPlayer` kullanan yerel modülle çalınır (`modules/kids-sound`); kayıt yapabilen bir ses kütüphanesi iOS uygulamasına dahil edilmez.
- Kod referansı: `App.js` içinde `openGate` / `passGate`, `src/modals.js` içinde `ParentalGateSheet`.

### Sürüm 1.1 Gönderim Dosyaları

- [ ] `docs/v1.1/` sayfaları `main`'e gönderildi ve bağlantılar açılıyor (uygulamadaki Gizlilik Politikası bağlantısı `v1.1/privacy.html` adresine gider)
- [ ] App Store Connect metinleri `store/v1.1/app-store-metadata.md` dosyasından kopyalandı (Promotional Text, What's New, Description, App Review Notes, URL'ler)
- [ ] Ekran görüntüleri `store/v1.1/screenshots/` klasöründen yüklendi (iPhone 6.9" ve iPad 13", EN + TR)
- [ ] Sürüm 1.0, `v1.0` git etiketiyle saklanıyor

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
- [ ] Fiziksel iPhone testleri tamamlandı (açılış, iki oyun modu, zor seviye süresi, ses efektleri, seslendirme, albüm)

## 6) Review Öncesi Son Kontrol

- [ ] App Privacy bölümü dolduruldu
- [ ] Export Compliance (encryption) soruları kontrol edildi
- [ ] Ekran görüntüleri ve açıklama final
- [ ] Submit for Review

## Hızlı Notlar

- `eas.json` içinde `submit.production.ios.ascAppId` alanını App Store Connect App ID ile doldur.
- Team bazlı imza sorunlarında `submit.production.ios.appleTeamId` alanını doldur.
- Her yeni gönderimde `buildNumber` artırmayı unutma.
