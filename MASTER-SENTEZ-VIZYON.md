# Master Sentez — Grup Şirketleri Finans Paneli Vizyonu

Üç kapsamlı araştırma raporunun sentezi. Lovable bu dosyayı dikkate alarak UI üretir.

Kaynaklar:
- **MEBA pattern aktarımı** (mevcut MEBA Komuta Merkezi'nden 25 olgun UI pattern)
- **Dünya finans yazılımı analizi** (Mosaic, Pigment, Mercury, Brex, Stripe, Bloomberg, Koyfin vb. 22 yazılım)
- **Türkiye pazar analizi** (Logo, Paraşüt, Bloomberg HT, Matriks IQ, Kuveyt Türk vb. 32 yazılım)

---

## 1. Stratejik Konumlama

**Pazarda doldurduğumuz boşluk:** Türkiye'de **multi-firma yönetici-için-tasarlanmış panel YOK**. Logo Wings, Login ERP, SAP gibi seçenekler CFO/muhasebeci için yapılmış, UX 2012'den kalma. Mehmet Bey gibi yöneticilerin "30 saniyede ne durumdayım" sorusuna kimse cevap vermiyor.

**Vaadimiz:** Bloomberg Terminal'in finansal grafik kalitesi + Mercury Bank'in luxury otomotiv estetiği + Linear/Vision Pro kurumsal polish + Anadolu iş kültürü doğal sıcaklığı.

---

## 2. Görsel Dil — Kati Standartlar

**Estetik referansı (tek cümle):** *"Pigment'in collaborative planning UX'i + Mercury'nin premium hissi + Bloomberg HT'nin finansal ciddiyeti + Linear'ın hızlı motion'u."*

- **Mod:** Koyu mod default; açık mod tam destek. Geçiş animasyonlu (240ms ease-out).
- **Tipografi:** Inter veya Geist; başlıklarda hafif tracking-tight; sayılar tabular-nums + font-mono.
- **Renk:** Nötr zinc/neutral zemin + firma signature accent:
  - MEBA `#0ea5e9` cyan
  - MESA `#8b5cf6` purple
  - ELMOS `#10b981` emerald
  - ARKON `#f59e0b` amber
- **Glass:** Backdrop-blur(28px) saturate(180%) — Vision Pro tarzı, abartısız.
- **Sayı formatı (KATİ):** `1.245.890,75 ₺` (Türk locale, ₺ sağda boşluklu). React-Intl veya Intl.NumberFormat tr-TR.
- **Tarih formatı:** "26 Mayıs 2026" (uzun) veya "26.05.2026" (kısa).

---

## 3. Mücevher Pattern'ler — Mutlak Uygulanacak

### 3.1 Mercury "Luxury Banking" estetiği (Dünya rapor #1)
- Geleneksel banka UI'sini bırak.
- Yumuşak gradient, ferah whitespace, içerik etrafında nefes.
- Finans bir "premium ürün" gibi sunulsun — Lexus showroom hissi.
- Renkler abartısız, hareket abartısız ama her şey "kaliteli kâğıt" gibi.

### 3.2 Stripe Morphing Modal (Dünya rapor #3 — popup şampiyonu)
- Modal/popup içerikten dolayı boyut değiştirirken **yumuşak adapte** olsun.
- `scaleX/scaleY` transform tabanlı container morph.
- Ani container atlaması YOK — spring transition (stiffness 320, damping 30).
- Bu tek detay grup panelini "olağan SaaS"tan "premium" sınıfa atlatır.

### 3.3 Pigment Agentic AI (Dünya rapor #2)
- Cmd+K palette'ine doğal dil sorgu kabul et.
- Örnek: kullanıcı "MESA Mayıs nakit" yazıyor → o anda chart üretiliyor, palette içinde gösteriliyor.
- "MEBA top 10 cari" → tablo. "ELMOS marj sapması" → grafik.
- AI üretim sırasında skeleton + 1500ms ease-out chart reveal.

### 3.4 MEBA Drawer (sağdan kayan sheet — MEBA rapor #1)
- Direkt kopya, sadece ikonlar değişecek (Iconify → lucide-react veya Iconify de eklenir).
- Swipe-to-close (drag x ekseni, 80px velocity 500), ESC, role=dialog aria-modal.
- Spring (stiffness 320, damping 34, mass 0.9), max-w 480px.
- Kullanım: Cari Detay drill-down, Logo Go sync ayar paneli, fatura kalem detayı, kullanıcı ayar.

### 3.5 MEBA notify lib — Sonner + AI + Cmd+Z undo (MEBA rapor #3)
- Direkt kopya. sonner paketi eklenir.
- Toast içinde AI aksiyon butonu: *"MEBA nakit forecast değişti — sapma raporu açayım mı?"*
- ⌘Z global undo (Türk evrak imza-tarih sağ-üst protokolü).
- 8sn auto-dismiss, 4 seviye (success/info/warning/error), top-right stacking.
- Kullanım: tüm CRUD aksiyonları, Logo Go sync uyarıları, hedef kaydetme.

### 3.6 MEBA HedefDuzenleModal — Center modal şablonu (MEBA rapor #2 popup primitif şampiyonu)
- Adapte et. Şablonu kopyala, içerik "4 firma hedef düzenle" olsun.
- Gradient header + ikonlu ID-card + scroll body (max 70vh) + sticky footer.
- **Canlı validation:** kişi toplamı vs firma hedefi farkı yeşil/sarı rozet.
- Mobile bottom-sheet + desktop center hibrit (`items-end md:items-center`).
- Spring scale 0.97→1.

---

## 4. Türkiye'ye Özel KATİ Pattern'ler

### 4.1 Mali takvim canlı uzatma takibi (Türkiye rapor en kritik bulgu)
- Türk yöneticisi sürekli endişeli: "KDV 28'inde mi, uzatma var mı?"
- Cloudflare Cron + GİB/SGK RSS scrape + anasayfa rozet.
- 3 gün önce push bildirim.
- Örnek 2026 Mayıs: MUHSGK 26→3 Haziran uzatıldı, KDV 1 Haziran→5 Haziran uzatıldı.
- **Hiçbir Türk yazılım bunu canlı yapmıyor** — bizim hızlı kazanım fırsatımız.

### 4.2 Çek/senet timeline (Türkiye rapor #2 boşluk)
- Türk B2B'sinin omurgası çek/senet.
- Tüm yazılımlar 2010 tablo estetiğinde gösteriyor.
- Biz Bloomberg HT görsel kalitesi + magazine kart anlatımıyla yapalım.
- Timeline view: bugünden vade tarihine kadar yatay şerit, çek/senetler bant üzerinde nokta + hover detay.
- Renk: hamiline yeşil, ciro pembe, vade geçmiş kırmızı.

### 4.3 WhatsApp + KEP mutabakat (Anadolu "ilişki defteri")
- Mutabakat Türk B2B'sinde WhatsApp ile yapılıyor.
- Hiçbir yazılım bunu native + güven skoru + insan boyutu ile birleştirmiyor.
- Cari kartında "Son mutabakat: 12 Mayıs WhatsApp, %96 uyum" rozeti.
- Yetkili kişinin doğum günü, son ziyaret tarihi, hatır notları yan panel.

### 4.4 Sayı/Para birimi formatı
- `Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })` → `1.245.890,75 ₺`.
- Kısaltma: 1.2 milyon yerine `1,2 Mn` veya `1,2M ₺`.
- EUR/USD switcher hazır olsun (Mehmet Bey ileride isteyecek — feedback_para_birimi memory).

### 4.5 Hitabet ve dil (KATİ)
- Her kullanıcıya "Bey" eki: Mehmet Bey, Yusuf Bey, Furkan Bey, Ahmet Bey, Fatih Bey.
- Aynı isimliler soyadla ayrıştır: "Mehmet Bakırdöğen Bey", "Mehmet Maraş Bey".
- AI yorum dilinde Anadolu ticaret kavramları uygundur: "el sıkışmak", "söz", "mutabakat", "hatır", "denge", "bereket".
- Yabancı kültür terimleri (guanxi, horenso, omotenashi, wabi-sabi) **ASLA**.

---

## 5. Sayfa Bazlı Esin Paketi

### Nabız
- Mercury homepage estetiği (luxury banking)
- Pigment KPI grid + count-up animasyonu (CNBC tarzı)
- Top: ticker tape (4 firma KPI'sı yatay scroll, çekirdek 3 ortak için)
- AI yorum kartı: Anadolu iş dili, 3-4 cümle (notify lib şablonu)

### Para Haritası
- Pigment Sankey diagram (Visx ile)
- Stripe Dashboard çubuk + trend rozet pattern'i
- Marj erozyon: tablo + tıklayınca Drawer ile drill-down

### Yarın 90 Gün
- Bloomberg HT time-series kalitesi (TradingView Lightweight Charts)
- Causal/Pigment slider simülasyon paneli
- **Mali takvim rozet** (canlı GİB/SGK uzatma takibi — Türkiye unique)

### Cari Detay
- Mercury detail view (luxury)
- MEBA Drawer drill-down (KPI → kategori → cari → fatura → kalem)
- Cari kartında WhatsApp mutabakat rozet + ilişki defteri yan panel
- Lower-third pattern: aktif cari adı + KPI'lar sabit alt bant

### Mali Tablo
- Tesla Investor Day reveal (GSAP timeline)
- Linear table styling (kurumsal sade)
- Şelale grafik (waterfall) — gelir tablosu için
- PDF export butonu (KOBİ patron alışkanlığı — Türk yazılım klişesi)

### Konsolide (sadece çekirdek 3 ortak)
- Mosaic Tech 4 firma KPI grid kart pattern'i
- Grup içi cari mutabakat tablosu (intercompany ledger)
- Matriks IQ tarzı yoğun bilgi sunumu (Türk yöneticisi alışkın)

### İş Geliştirme (tüm 5 kullanıcıya açık)
- Linear board view (kanban gibi)
- Yönlendirme defteri (Anadolu "el sıkışmak" görsel ifade)
- Tedarikçi havuzu paylaşımlı iskonto notları

---

## 6. Lovable İçin Hızlı Karar Notları

- **Iconify ekle** (lucide-react yanına) — MEBA pattern aktarımı 10x hızlanır.
- **sonner ekle** — notify lib bağımlı.
- **cmdk ekle** — CommandPalette bağımlı.
- **@visx/visx** — Sankey + advanced data viz.
- **gsap** — chart reveal sinematik (Webflow satın alımı sonrası ücretsiz).
- **lightweight-charts** — TradingView, Yarın 90 Gün + Cari Detay time-series.
- **@tremor/react** — dashboard polish.
- **react-countup** — CNBC tarzı sayı animasyonu.

Tüm bu paketler `package.json`'a eklendi (GSAP, Visx, Tremor, Lightweight Charts, react-countup zaten var; sonner + cmdk + iconify Sprint 1'de eklenecek).

---

## 7. KOBİ Patron Yorgunluk Noktalarını TERSİNE Yap

Türkiye raporundan: Logo Tiger'da en sevilmeyen 5 şey, biz aksini yapacağız:

1. **Rapor zayıf** → biz: AI yorum + canlı drill-down + Bloomberg kalite chart
2. **Yavaş** → biz: edge cache + Cloudflare Workers + lazy-load + skeleton
3. **Windows 11 crash** → biz: web-first, cross-platform
4. **Destek pahalı** → biz: AI Cmd+K ile sorgu, dökümana ihtiyaç azalır
5. **e-Defter arızalı** → biz: Logo Go ile sync, e-Defter Nilvera entegrasyonu (Sprint 2-3)

---

## 8. "Vay Be!" Anları (Mükemmellik Müzesi)

Her birini en az 1 sayfada uygulayacağız:

1. **Count-up sayı dansı** (Pigment + react-countup) — her KPI 0→değer
2. **Sankey para akışı** (Bloomberg + Visx) — Para Haritası
3. **Mali takvim canlı uzatma rozet** (Türkiye unique) — her sayfa üst banner
4. **AI Cmd+K doğal dil chart** (Pigment) — palette içinde instant grafik
5. **Stripe morphing modal** — popup boyut değişiyor yumuşacık
6. **Tesla Investor Day reveal** (GSAP) — Mali Tablo satır satır beliriyor
7. **Mercury luxury feel** — koyu tema, ferah whitespace, sayfa derinliği
8. **WhatsApp mutabakat rozeti** (Türkiye unique) — cari kartında "12 May %96 uyum"
9. **Ticker tape üstte** (CNBC) — Nabız sayfası 4 firma KPI yatay scroll
10. **Anadolu iş dili AI yorumu** — "Mehmet Bey, BOYTAŞ'ın vadesi sıkışmış, hatırlama vakti gelmiş"

---

## 9. Sprint Sıralaması

**Sprint 1 (4-6 saat):** Temel popup primitifleri
- MEBA Drawer kopyala
- MEBA notify lib kopyala (sonner ekle)
- MEBA HedefDuzenleModal şablonu adapte et (FirmaHedefDuzenleModal)
- package.json: sonner + cmdk + iconify ekle

**Sprint 2 (4-6 saat):** Layout + navigation
- MEBA ElitHeader adapte et (Grup paneli için 4 firma + Konsolide dropdown)
- CommandPalette adapte et (5 sayfa + AI hızlı aksiyon)
- OnboardingTour adapte et (6 adım grup paneli için)
- GlassCard kopyala (Vision Pro parallax)

**Sprint 3 (6-8 saat):** Sayfa içerikleri başlangıç
- Nabız: KPI grid + ticker tape + count-up + AI yorum kartı
- Para Haritası: Sankey + marj erozyon
- Mali takvim canlı uzatma takibi (Cloudflare Cron + RSS scrape)

**Sprint 4 (8-10 saat):** Gelişmiş sayfa içerikleri
- Cari Detay drill-down (Drawer ile)
- Yarın 90 Gün (TradingView + simülasyon)
- Mali Tablo (waterfall + Tesla reveal)

**Sprint 5 (4-6 saat):** Konsolide + İş Geliştirme + cila
- Konsolide Grup Paneli (sadece çekirdek 3 ortak)
- İş Geliştirme paneli (5 kullanıcıya açık)
- Polish, accessibility, mobile responsive testleri

**Toplam tahmin:** 26-36 saat (4-6 sprint).

---

## 10. Memory Kaynakları

Detaylı bilgi için bu memory dosyalarına bak:
- `reference_meba_pattern_aktarim_2026_05_26.md` — MEBA'dan 25 UI pattern
- `reference_dunya_finans_yazilim_analizi_2026_05_26.md` — 22 dünya yazılımı
- `reference_turkiye_finans_yazilim_analizi_2026_05_26.md` — 32 Türkiye yazılımı
- `reference_broadcast_grafik_arastirma_2026_05_26.md` — 20 broadcast kalite lib
- `feedback_broadcast_kalite_grafik.md` — broadcast quality KATİ kural
- `feedback_grup_finans_ayri_program.md` — AYRI program kuralı
- `feedback_ortak_guveni_kati.md` — audit log YASAK
- `feedback_yazi_tarzi_rahat.md` — yazışma tonu
- `project_dortlu_grup.md` — 4 firma yapısı + yetki matrisi
