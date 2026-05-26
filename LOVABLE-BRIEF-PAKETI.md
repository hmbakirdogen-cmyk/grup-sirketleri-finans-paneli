# Lovable Brief Paketi — Grup Şirketleri Finans Paneli

> **Kullanım:** Aşağıdaki her sayfa için ayrı bir bölüm var. Lovable chat'ine
> sırayla, **bir seferde bir bölüm** yapıştırın. AI her bölümü tek seferde
> uygular, sonraki bölüme geçmeden önce preview'da kontrol edin.
> Genel tasarım kuralları her brief'in başında özetlenmiş — Lovable AI
> tutarlılığı korur.

---

## ORTAK TASARIM DİLİ (her brief'e dahil)

```
TASARIM DİLİ — KATI:
- Apple sadeliği + Tesla premiumluğu + üst düzey yönetim paneli
- Az bileşen, güçlü bilgi, premium görünüm
- 3 saniyede anlaşılan: durum iyi mi / en önemli sayı ne / ne yapmalı

YAPI:
- Üstte sekme nav: Nabız · Akış · Alacaklar · Raporlar · Ayarlar
- Sekme altında Mali Takvim rozet şeridi (KDV / SGK / Muhtasar gün sayaçları, ≤3 gün altın)
- Sayfa içinde: 4 büyük KPI üst + 1 ana grafik orta + 3 destek kart alt
  (sayfaya göre farklı yapı olabilir, brief'te belirtilir)

RENK KURALLARI (5 renk diski KATI):
- Zemin: #0a0b0e koyu antrasit (kart üstü #13151b → #0f1116 gradient)
- Ana vurgu: #5b9dff elektrik mavi
- İkincil vurgu: #d4af7a metalik altın (yalnızca 1 yerde: hedef line veya kritik vurgu)
- Pozitif: #4ade80 yumuşak yeşil
- Negatif: #f87171 mat kırmızı
- Metin: #f3f4f6 ana, #94a3b8 etiket, #64748b soluk
- Border: rgba(255,255,255,0.06), hover'da 0.12

TİPOGRAFİ:
- Inter font, font-variant-numeric tabular-nums KATI
- KPI rakam: 38px, weight 500, letter-spacing -0.02em
- Etiket: 11px uppercase, letter-spacing 0.12em
- Alt bilgi: 12px

ETKİLEŞİM:
- Hover %5-10 değişim (border opacity 0.06 → 0.12)
- Animasyon ≤200ms
- Intro 280ms fadeUp staggered
- prefers-reduced-motion respect
- Hover olmadan da okunabilir

GRAFİK KURALLARI:
- Aynı ekranda max 1 ana grafik + 2 destek
- Aynı grafikte max 2 veri serisi
- Grid çizgileri çok hafif (rgba white 0.04)
- 3 yatay tick yeter
- X ekseni: 12 aydan 4 ay etiketi
- Y ekseni: 3 değer
- Glow / neon / 3D rotate YASAK
- Süs için grafik veya ikon eklenmez

TÜRK FİNANSAL BAĞLAM:
- Para format: "147,3M ₺" / "29.540.000 ₺"
- Tarih: "26 Mayıs 2026"
- Hitap: "Mehmet Bey / Fatih Bey / Ahmet Bey" (çıplak ad asla)
- Mali Takvim: GİB/SGK gerçek vade tarihleri + uzatma takibi
- AI yorum: Anadolu iş dili (mutabakat, bereket, el sıkışmak, söz)
```

---

## 1) AKIŞ SAYFASI

```
Görev: /akis sayfasını oluştur.

ORTAK TASARIM DİLİ yukarıda — KATI uygula.

SAYFA AMACI:
"Para nereden geldi, nereye gitti" yöneticiye 5 saniyede anlatmak.

ÜST 4 KPI (yıllık, geçen döneme göre delta):
1. Aylık Ortalama Gelir
2. Aylık Ortalama Gider
3. Net Aylık Akış
4. Operasyon Marjı (%)

ORTA — TEK ANA GRAFİK:
"Akış Köprüsü" (basit yatay Sankey benzeri):
- Sol kolon: 3 gelir kategorisi, kalınlık = oranı, mavi tonlar
- Orta kutucuk: Toplam Net Satış (büyük rakam)
- Sağ kolon: 3 gider kategorisi + 1 Net Kâr, gider altın tonları, net kâr yeşil
- Aralarda yumuşak bezier akış şeritleri
- Hover'da ilgili akış parlatılır (%5-10), diğerleri %35 opaklığa düşer

SAĞ DİKEY PANEL — Yönetici Özeti:
- "Gelir Dağılımı" başlığı altında üst 3 gelir kategorisi (oran progress bar)
- Alt kısımda "Marj Erozyonu" mini bar: 12 ay brüt marj trendi (basit area chart)
- En altta GENEL DURUM kutusu — AI yorum (Anadolu iş dili)

ALT — 3 DESTEK KART:
- En Hızlı Büyüyen Gelir
- En Hızlı Artan Gider
- Marj Trendi (12 ay delta)

VERİ KAYNAĞI: mock-finans.ts içindeki paraHaritasi alanı (FINANS_VERISI[firmaId].paraHaritasi)
KOMPONENT: AkisSayfasi.tsx (mevcut yapıdan uyumlu)
NAVİGASYON: useState sekme="akis" → bu sayfa
```

---

## 2) ALACAKLAR SAYFASI

```
Görev: /alacaklar sayfasını oluştur.

ORTAK TASARIM DİLİ yukarıda — KATI uygula.

SAYFA AMACI:
Açık alacak/borç pozisyonu + riskli müşteri uyarısı + vade dağılımı.

ÜST 4 KPI:
1. Toplam Açık Alacak (TL)
2. Toplam Açık Borç (TL)
3. Net Açık Pozisyon (alacak - borç)
4. Ortalama Vade Günü

ORTA — ANA İÇERİK:
Sol 2/3: Top 10 cari tablosu
- Kolonlar: Cari Adı / Tip (müşteri/tedarikçi rozet) / Toplam Ciro / Açık Bakiye / Vade (gün) / Son Hareket
- Zebra çok hafif (rgba white 0.015)
- Sayılar tabular-nums, sağa hizalı
- Vade ≤7 gün riskli (altın), <0 vade geçmiş (kırmızı)
- Satıra hover'da border altı mavi belirir
- Tıklama: cari detay drawer açar (sağdan kayan panel)

Sağ 1/3: Yönetici Özeti
- "Vade Dağılımı" başlığı altında 4 progress bar:
  - 0-30 gün
  - 30-60 gün
  - 60-90 gün
  - 90+ gün (kırmızı renk)
- Altında "Riskli Cariler" listesi: 3 satır, açık bakiye + vade gün
- GENEL DURUM: AI yorum (Anadolu iş dili)
  Örn: "Mustafa Beyle hatırlatma yapılırsa kapanır, ELMOS ile mutabakat tazelenmeli."

ALT — 3 DESTEK KART:
- Bu Ay Tahsil Edilen
- Vadesi Geçen Toplam (TL)
- Tahsilat Hızı (DSO — gün)

VERİ KAYNAĞI: FINANS_VERISI[firmaId].cariler
KOMPONENT: AlacaklarSayfasi.tsx
```

---

## 3) RAPORLAR SAYFASI

```
Görev: /raporlar sayfasını oluştur.

ORTAK TASARIM DİLİ yukarıda — KATI uygula.

SAYFA AMACI:
Bilanço + Gelir Tablosu yönetici özeti, dönem karşılaştırma, finansal sağlık.

ÜST 4 KPI:
1. Aktif Toplam
2. Pasif Toplam
3. Öz Kaynak
4. Net Kâr (dönem)

ORTA — İKİ YAN YANA TABLO:
Sol 1/2: Bilanço Özet
- Aktif satırları (Dönen Varlıklar, Duran Varlıklar, alt satırlar girintili)
- Pasif satırları (KV Yabancı Kaynaklar, UV Yabancı Kaynaklar, Öz Kaynaklar)
- Toplam satırı kalın, üstte ve altta 1px border
- Sayılar tabular-nums, sağa hizalı
- Genişletilebilir satırlar (chevron ▾)

Sağ 1/2: Gelir Tablosu Özet
- Net Satışlar → SMM (-) → Brüt Kâr → Faaliyet Gid (-) → Faaliyet Kâr → Finansman (-) → Vergi (-) → Net Kâr
- Düşüm satırlarında küçük "-" işareti
- Alt satırda yüzde (Net Kâr / Satış %)

SAĞ ÜST — Dönem Seçici:
"Aylık / Çeyrek / Yıllık" segmentli toggle (FirmaSecici stilinde)

ALT — 3 DESTEK KART (finansal oranlar):
- Cari Oran (Dönen Varlık / KV Borç)
- Likidite (Hazır Değerler / KV Borç)
- Borç / Öz Kaynak Oranı

GENEL DURUM kutusu sağ altta — finansal sağlık yorumu.

DETAYLAR:
- "PDF Export" butonu sağ üstte minimal
- Karşılaştırma toggle: "Geçen yılla karşılaştır" → satırlarda iki kolon olur

VERİ KAYNAĞI: FINANS_VERISI[firmaId].bilanco + .gelirTablosu
KOMPONENT: RaporlarSayfasi.tsx
```

---

## 4) VERGİ ATÖLYESİ (ek özellik, Mehmet Bey direktifi)

```
Görev: /vergi-atolyesi sayfasını oluştur.

ORTAK TASARIM DİLİ yukarıda — KATI uygula.

SAYFA AMACI:
Geçici vergi öncesi (3 ayda bir) muhasebeci Osman Bey ile yapılan stok ayarı dijitalleşsin.
Yasal sınırlar içinde stok değerleme yöntemi + dönem sonu stok ayarı senaryosu.

ÜST 4 KPI:
1. Bu Çeyrek Tahmini Matrah
2. Bu Çeyrek Geçici Vergi Tahmini (%25 kurumlar)
3. Senaryo Sonrası Vergi (canlı)
4. Vergi Tasarrufu / Artışı (delta)

ORTA — İKİ KOLON ATÖLYE:
Sol kolon: Mevcut Durum
- Net Satışlar (Q)
- SMM (mevcut, yöntem: Ağırlıklı Ortalama)
- Brüt Kâr
- Faaliyet Giderleri
- Matrah
- Geçici Vergi (%25)
Hepsi tabular-nums tablo satırları.

Sağ kolon: Senaryo Atölyesi
- Stok Değerleme Yöntemi: toggle "Ağırlıklı Ortalama / FIFO"
- Dönem Sonu Stok Ayarı: ±%20 slider
  Sol: "Stok azaldı (SMM ↑, vergi ↓)"
  Sağ: "Stok arttı (SMM ↓, vergi ↑)"
- Anlık güncelleme (≤200ms)

ALT:
- Karşılaştırma çubuğu: Mevcut Vergi (mavi bar) vs Senaryo Vergi (altın bar)
- "Osman Bey'e Gönder" butonu (PDF + WhatsApp)
- Hukuki not kutusu: "VUK madde 274 stok değerleme yöntemi seçimi yasal sınırlar içinde. Yöntem değişimi yıl başında beyan ister. Stok sayım ayarı gerçek envanterle tutarlı olmalı."

AI YORUM (Anadolu iş dili):
"Stok 500K artırırsanız vergi 125K düşer, ancak gerçek envanterle tutarlı olmalı.
Osman Bey ile sayım sonucu mutabık kalın."

VERİ KAYNAĞI: FINANS_VERISI[firmaId].gelirTablosu (yıllık değerler ÷ 4)
KOMPONENT: VergiAtolyesiSayfasi.tsx
```

---

## 5) AYARLAR SAYFASI

```
Görev: /ayarlar sayfasını oluştur.

ORTAK TASARIM DİLİ yukarıda — KATI uygula.

SAYFA AMACI:
Kullanıcı + firma + veri kaynağı + bildirim ayarları, sade tek sayfa.

YAPI:
Sol dikey nav (5 bölüm, küçük başlıklar):
1. Profil
2. Firma & Yetki
3. Bildirim
4. Veri Kaynağı
5. Gizlilik & Çıkış

Sağ ana panel — seçili bölüme göre değişen form.

BÖLÜM 1 — PROFİL:
- Ad, hitap (Mehmet Bey / Fatih Bey)
- E-posta
- Telefon (WhatsApp Business uyumlu)
- Avatar (fotoğraf yükleme, daire kırpılmış)

BÖLÜM 2 — FİRMA & YETKİ:
- "Yetkili olduğun firmalar" listesi (chip)
- Çekirdek 3 ortak: 4 firma + Konsolide
- Tek firma yöneticisi: tek firma + Konsolide yok
- Yönettiği firma vurgulu (büyük chip)

BÖLÜM 3 — BİLDİRİM:
- Toggle satırları:
  - Mali Takvim 3 gün öncesi
  - Açık alacak vade geçti
  - Aylık AI brief (her ayın 1'i)
  - Kritik nakit eşiği altında
- Her toggle yanında "WhatsApp / E-posta / Push" üçlü seçim

BÖLÜM 4 — VERİ KAYNAĞI:
- Logo Go server: bağlı / bağlı değil (yeşil/kırmızı nokta)
- Son sync zamanı
- "Şimdi sync et" butonu (sade, mavi)
- E-Defter / GİB API durumu

BÖLÜM 5 — GİZLİLİK & ÇIKIŞ:
- "Audit log gösterme" toggle (KATI: ortak güveni > teknik kontrol)
- Şifre değiştir
- Çıkış (kırmızı, sade)

VERİ KAYNAĞI: useAuth + KULLANICILAR
KOMPONENT: AyarlarSayfasi.tsx
```

---

## Brief uygulamacı için son notlar

- Her sayfa Lovable AI tarafından **bir seferde** yapılır
- Her sayfanın sonunda preview'da test edin, beğenmediğiniz noktayı küçük
  follow-up mesajla rafine edin ("Vade rozetlerini biraz daha küçük yap" gibi)
- Tüm sayfalarda **Mali Takvim üst rozeti** ve **sekme nav** sabit kalır
- Hesaplama mantığı `mock-finans.ts` ile aynı — Lovable AI hesap yazmaz, mevcut veriden okur
- Üretim öncesi: Logo Go canlı sync bağlandığında `mock-finans.ts` değiştirilmeyecek, yerine `lib/logo-sync.ts` aynı şemada veri döner
