# Logo Go Bayi Görüşme Brief

**Mehmet Bey için toplantı dokümanı — bayiye yapılacak görüşmede yanında bulunur.**

---

## Toplantının amacı

4 firma grubumuzun (MEBA + MESA + ELMOS + ARKON) yöneticileri için **özel bir
finansal analiz paneli** geliştiriyoruz. Logo Go'da zaten tutulan veriyi
okuyup yöneticilere bir üst katman görüş sağlayacak — Logo Go'nun yerini
ALMAYACAK, yanında çalışacak.

Bu yüzden bayiden 3 şey istiyoruz:

1. **Veri okuma izni** (yazma değil — sadece okuma)
2. **Hangi teknik yolu önerdiğini** (API / SQL view / nightly export)
3. **Maliyet ve lisans çerçevesini**

---

## Mevcut altyapımız (bayiye anlatılacak)

- **Tek Logo Go server**, MESA Enerji ofisinde kurulu (Kayseri OSB)
- 4 firma da **aynı server üzerinde** çalışıyor:
  - MEBA Mekanik
  - MESA Enerji
  - ELMOS Otomasyon
  - ARKON Otomasyon (Konya, ama veri MESA'daki Logo Go'da)
- Mali müşavirlik her firma için ayrı, ama veri tek lokasyonda toplanıyor

**Bu, bayi için kolaylık:** tek lokasyona tek entegrasyon yetiyor; 4 ayrı
kurulum gerekmez.

---

## İstediğimiz veri (hangi tablolardan)

Aşağıdaki başlıklarda, her 4 firma için **son 3 yıl + bu güne kadar canlı**:

### Kategori 1 — Cari hesap defteri
- Cari kart listesi (kod, unvan, vergi no, tip: müşteri/tedarikçi)
- Cari hareketleri (tarih, fiş tipi, borç, alacak, bakiye)
- Açık fatura listesi (vade, kalan tutar)

### Kategori 2 — Fatura & kalem
- Satış faturaları başlık (no, tarih, cari, KDV hariç/dahil)
- Satış fatura kalemleri (stok kodu, miktar, birim fiyat, satır tutarı,
  iskonto)
- Alım faturaları (aynı detayda)
- İade faturaları

### Kategori 3 — Banka ve nakit
- Banka hareketleri (giriş/çıkış, açıklama, karşı taraf)
- Kasa hareketleri
- Çek/senet portföyü (alacak/borç, vade)

### Kategori 4 — Stok
- Stok kartı (kod, ad, kategori, birim)
- Stok hareketleri (giriş, çıkış, sayım fişi)
- Mevcut stok seviyesi

### Kategori 5 — Mali tablo (resmi format)
- Bilanço (Logo Go'nun yıl sonu standart formatı)
- Gelir tablosu
- Mizan

### Kategori 6 — Vergi & SGK
- KDV beyannamesi tutarları
- Stopaj
- SGK ödeme planı (varsa)

---

## Teknik seçenekler (bayi hangisini önerirse)

Hangisinin uygulanabileceğini ve bayinin tercih ettiğini öğrenmek istiyoruz.

### Seçenek A — Logo Go REST/SOAP API
Eğer Logo Go'nun resmi bir API'si varsa, gece bir job ile veriyi çekeriz.

**Sorulacak:**
- Logo Go'da yerleşik API mevcut mu?
- Hangi modüller API üzerinden erişilebilir?
- Token / yetkilendirme nasıl çalışıyor?
- API çağrı sınırı / throttling var mı?
- Ek lisans ücreti var mı?

### Seçenek B — SQL view erişimi (read-only)
Logo Go MSSQL üzerinde çalışıyor. Bayinin oluşturacağı / önereceği view'lara
sadece okuma kullanıcısı ile erişip gece toplu çekeriz.

**Sorulacak:**
- Doğrudan DB'ye read-only kullanıcı tanımlanabilir mi?
- Schema değişikliklerinde view'ları nasıl güncel tutacağız?
- Logo Go güncellemelerinde schema bozulur mu?
- Hangi tablolar/view'lar resmi olarak kullanılabilir (deprecation
  riski olmayan)?

### Seçenek C — Nightly XML/CSV export
Logo Go'nun yerleşik export modülü varsa, gece bir tetikle dosya çıkışı
alıp panele yükleyebiliriz.

**Sorulacak:**
- Otomatik tetiklenebilir export var mı?
- Hangi formatlar destekleniyor?
- Tablolar arası ilişki bilgisi (FK) export'ta korunuyor mu?

---

## Sync Agent mimari önerimiz

Bayinin görüşüne sunulacak plan:

```
[ MESA ofisi — Logo Go server ]
              │
              ▼
   [ Nightly Sync Agent ] (gece 03:00 çalışır)
              │
              ▼
   [ Veri katmanı: Cloudflare D1 / Postgres ]
              │
              ▼
   [ Yönetici paneli — TanStack Start ]
```

- Sync agent okuma yapar, **Logo Go'ya yazma yok**
- Yerel DB'ye snapshot atar, panel ondan okur
- Hata durumunda Logo Go etkilenmez
- Veri günlük taze (gerçek zamanlı değil — ihtiyaç yok)

---

## Bayiden alınacak somut sorular

Aşağıdaki listeyi toplantıda madde madde sorun:

1. Logo Go sürümümüz ne (Standard / Professional / Wings)? Resmi API kapsamı
   sürüme göre değişir mi?
2. Resmi API dokümantasyonuna nasıl erişiriz?
3. SQL view erişimi vermek için **ek lisans bedeli** var mı?
4. Gece otomatik çalışacak read-only bir kullanıcının teknik sakıncası var mı?
5. Logo Go sürüm yükseltmesinde DB schema bozulursa view'ları kim sürdürür?
6. **4 firma için tek server lisansı** mı, her firma için ayrı mı?
7. Saha kurulum + entegrasyon desteğiniz var mı? Saatlik/sabit ücret nasıl?
8. Bizden başka, benzer iş yaptığınız referans var mı (yönetim paneli
   entegrasyonu)?
9. Bilanço/Gelir Tablosu rakamlarının resmi formatıyla aynı çıkması için
   hangi tablolardan çekmeliyiz?
10. Çek/senet portföyü tablosu hangi modülde tutuluyor (banka mı ayrı)?
11. Stok hareketleri ile fatura kalemleri arasındaki bağ nasıl kurulur?
12. KDV iadesi/devirleri için ayrı sorgu/işlem var mı?
13. Mali müşavirin sisteme dokunduğu kayıtlar (e-Defter aktarımı, dönem
    kapama vb.) gerçek zamanlı görünür mü, yoksa müşavirden ayrı veri mi
    isteyelim?
14. Veri tabanı yedeklemesi şu an nasıl alınıyor? Ek yedek planı gerekir mi?
15. Server'a uzaktan erişim hakkımız nasıl olacak (VPN / IP whitelist)?

---

## Bütçe açısından duruşumuz

Toplantıda iki seviye netleşirse rahat ederiz:

- **Tek seferlik kurulum:** API/view açılışı, ilk konfigürasyon, eğitim
- **Aylık bakım/destek:** Logo Go sürüm geçişleri, küçük schema güncellemeleri

Bayinin sunduğu rakam üzerine pazarlık marjı olduğunu varsayıyoruz. Anadolu
ticareti gereği ilk teklif son teklif değildir.

---

## Toplantıdan beklediğimiz sonuç

Toplantı bitiminde elimizde şunlar olsun:

- [ ] Önerilen teknik yol (A/B/C'den hangisi)
- [ ] Yaklaşık maliyet (tek seferlik + aylık)
- [ ] Bir sonraki adım (teklif belgesi tarihi)
- [ ] Bayi tarafında muhatap kişi + telefon
- [ ] Teknik dokümantasyon paylaşım yolu

---

## Toplantı sonrası

Toplantı çıktıları memory'e işlenir, panel tarafında gerçek veri katmanı
buna göre planlanır. O zamana kadar mock data ile geliştirmeye devam
edilir — geliştirme bayi yanıtını beklemez.
