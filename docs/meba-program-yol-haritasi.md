# MEBA Program Yol Haritasi

Bu not, 27 Mayis 2026 itibariyla mevcut MEBA gercek veri modu uzerinden bir sonraki gelisim katmanlarini siralar.

## Simdiki durum

- Uygulama artik mock veri kullanmiyor.
- MEBA tarafi gercek veri ile besleniyor:
  - 2023-2025 yillik mali tablo
  - 2025 aylik KDV/ciro
  - 2026 Ocak-Mayis satis faturasi ve vade
  - 2026 alacak yaslandirma
  - sektor kirilimi
  - cari/urun detayi
  - tahsilat projeksiyonu
- Build ve typecheck temiz.

## En kritik urun gelisimleri

1. Veri Guven Endeksi
- Her sayfada `canli`, `tahmini`, `bekliyor` rozeti.
- Ozellikle urun marji, personel ve cek/senet ekranlarinda yanlis kesinlik hissini azaltir.

2. Tahsilat Operasyon Masasi
- Geciken cari listesi
- Bugun aranacaklar
- Bu hafta vadesi gelenler
- Tek tusla not alma / durum guncelleme

3. Gercek Urun Karliligi
- Alis faturasi kalemleri gelince urun bazli gercek maliyet
- Musteri bazli marj
- Teklifte zarar riski uyarisi

4. Banka ve Kasa Gerceklesme Katmani
- 90 gun ekranini tahminden gercege tasir
- Tahsilat projeksiyonu ile banka hareketleri mutabakatlanir
- Gunluk net nakit panosu acilir

5. Cek/Senet Gercek Modulu
- Portfoyde
- Tahsilde
- Karsiliksiz
- Vade yigin haritasi

6. Musteri Risk Skoru
- Acik bakiye
- Gecikme gunu
- Son siparis tarihi
- Sektor riski
- Musteri yogunluk puani

7. Vergi ve Muhasebe Kontrol Merkezi
- Beyanname takvimi
- Odenecek vergi tahmini
- Donem kapanis checklisti
- Mizan gelince hesap bazli sapma denetimi

## Teknik gelisimler

1. Import Pipeline
- Masaustu klasorunden tek komutla yeniden parse
- Hangi dosya ne zaman islenmis audit kaydi
- Hata veren dosya icin net rapor

2. Veri Surumleme
- Her import icin tarih damgali snapshot
- "Bu ekran hangi kesite gore uretilmis" bilgisi
- Geri donup karsilastirma yapabilme

3. Kod Bolme ve Performans
- `charts-vendor` ve ana bundle buyuk
- Nadiren acilan sayfalari lazy load etmek mantikli
- Ozellikle 3D ve show komponentleri ayri chunk olmali

4. Test Katmani
- Veri donusum fonksiyonlari icin unit test
- JSON schema check
- Kritik KPI hesaplari icin snapshot test

## Oncelik sirasi

### Faz 1
- Cari hareket exportu
- Alis faturasi exportu
- Banka hareketleri

### Faz 2
- Cek/senet portfoyu
- Bordro ozeti
- Stok envanteri

### Faz 3
- Mizan
- Bilanço / gelir tablosu detay exportu
- Tam otomatik Logo Go baglantisi

## UI/urun firsatlari

- "Bugun neye bakmaliyim?" ana sayfa brief'i
- Mehmet Bey icin sabah yonetici ozeti PDF cikisi
- Buyuk musteri konsantrasyon alarmi
- Durgun musteri geri kazanma listesi
- En cok bozulan marj kalemleri listesi
- Sektor bazli buyume isaretleri

## Net sonuc

Bu program artik gosterim prototipi degil; gercek veri tabanli yonetim paneline donusmus durumda.
Bir sonraki buyuk sicrama, `alis + banka + cari hareket` ucunu tam gercege baglamak olacak.
