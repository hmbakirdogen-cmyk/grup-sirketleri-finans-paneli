# Lovable Prompt — Grup Şirketleri Finans Paneli

> Bu prompt'u Lovable'da `grup-sirketleri-finans-paneli` boş projesine yapıştırın.
> Repo: https://github.com/hmbakirdogen-cmyk/grup-sirketleri-finans-paneli

---

## Proje

**Ad:** Grup Şirketleri Finans Paneli
**Kapsam:** 4 firmadan oluşan bir sanayi grubunun (Kayseri merkezli MEBA / MESA /
ELMOS + Konya merkezli ARKON) yöneticilerine özel **finansal analiz paneli**.
**Kullanıcı:** 5 yönetici (3 çekirdek ortak + 2 tek firma yöneticisi).
**Veri:** Logo Go (tek server MESA'da, 4 firma aynı DB'den) → şu an MOCK ile
geliştir; gerçek Sync Agent sonra.

Bu **bağımsız** bir yazılımdır — başka herhangi bir iç araçla aynı kodu paylaşmaz.

## Stack — KATİ

- **Framework:** TanStack Start (file-based routing)
- **Bundler:** Vite
- **Stil:** Tailwind CSS v4 (`@import "tailwindcss"`)
- **UI:** shadcn/ui (gerektikçe yükle) + **Tremor** (dashboard polish)
- **Motion:**
  - Framer Motion (sayfa geçişi + kart hover + giriş animasyonları)
  - **GSAP** (chart reveal sinematik + timeline animasyonları, Tesla
    Investor Day kalitesi — Webflow'un satın alımı sonrası ücretsiz)
- **Grafik:**
  - **Visx** (Airbnb): Sankey, custom data viz, drill-down
  - **TradingView Lightweight Charts**: Cari Detay + Yarın 90 Gün time-series
    (45KB, Bloomberg HT/Matriks IQ kalitesi)
  - **Tremor**: hazır KPI kartı + bar chart (Linear polish)
  - **Recharts**: basit sparkline + line chart (eskiden kalan)
- **Sayı animasyonu:** **react-countup** (CNBC tarzı 0→değer sayma)
- **Dil:** TypeScript strict + `noUncheckedIndexedAccess`

## Estetik vizyonu

> **Bloomberg Terminal + CNBC + Apple Keynote sinematik + Linear/Vision
> Pro kurumsal polish.**
>
> Mehmet Bey direktifi: "Programımın tamamen arayüzü o kadar havalı ama
> kurumsallığa bağlı olmasını istiyorum. Haberlerde alt yazılar, ticker
> tape, grafik animasyonları, sayı dansları — bunlara bayılıyorum."

- Koyu mod öncelikli (default), açık mod tam destek (geçiş animasyonlu)
- Cam morfizm (subtle, abartısız) — `backdrop-blur` + ince border
- Tipografi: Inter veya Geist, başlıklarda hafif tracking-tight
- Renkler: nötr gri zemin (zinc/neutral) + her firma için signature accent
  (MEBA #0ea5e9 cyan · MESA #8b5cf6 purple · ELMOS #10b981 emerald · ARKON
  #f59e0b amber)
- Hover'da kartlar 1.5px yukarı kalkar, gölge yumuşar
- Sayfa geçişleri: 240ms slide+fade (Framer Motion)

### Broadcast quality — her sayfada en az 1 sinematik "an"

- **Sayı animasyonu (KATİ):** Her KPI değeri **react-countup** ile 0'dan
  hedef değere sayar (CNBC tarzı). Statik display YASAK. 1500-2000ms
  ease-out, format='turkish' locale.
- **Chart reveal:** Her grafik ilk açılışta GSAP timeline ile yavaş çizilir
  (Tesla Investor Day kalitesi). `gsap.from('.chart-line', {drawSVG: 0})`
  veya yumuşak stagger.
- **Ticker tape (Nabız üstünde):** Firmaların 4 KPI'sı (ciro, marj, alacak,
  nakit) yatay scroll'la sürekli akar — CNBC alt şerit tarzı.
- **Sankey diagram (Para Haritası):** Visx Sankey — gelir kategorilerinden
  brüt kara → faaliyet karı → net kar para akışı (Bloomberg tarzı).
- **Lower-third (Cari Detay):** Aktif cari adı + temel KPI'ları sayfa
  altında sabit bant — haber sunucusu altındaki bilgi şeridi tarzı.
- **Time-series (Yarın 90 Gün, Cari Detay):** TradingView Lightweight
  Charts — Bloomberg HT/Matriks IQ kalitesi, 45KB, tooltip + zoom + crosshair.
- **Tesla Investor Day reveal (Mali Tablo):** Bilanço satırları sırayla
  yukarıdan aşağıya beliriyor, her satırda kısa pause + count-up.

### Broadcast moment haritası (her sayfa için en az 1)

| Sayfa | Broadcast moment |
|-------|------------------|
| Nabız | Ticker tape üstte + KPI count-up + sparkline reveal |
| Para Haritası | Visx Sankey diagram + chart reveal animasyonu |
| Yarın 90 Gün | TradingView Lightweight Charts + simülasyon scrub-able timeline |
| Cari Detay | Lower-third sabit cari bilgi + drill-down zinciri + mini sparkline |
| Mali Tablo | Tesla Investor Day reveal — satır satır beliriyor + count-up |
| Konsolide | Sankey grup içi akış + 4 firma KPI grid animasyonu |

> Lisans: Hepsi **0 TL** — GSAP Webflow satın alımı sonrası (2024 Eylül)
> tamamen ücretsiz, TradingView Lightweight Charts Apache 2.0, Visx MIT,
> Tremor Apache 2.0, react-countup MIT. Toplam ~130KB ekstra bundle.
>
> Detaylı araştırma: `BROADCAST-GRAFIK-ARASTIRMA.md` (bu klasörde).

## Kullanıcılar ve yetki — KATİ matris

```
                       MEBA  MESA  ELMOS  ARKON   Konsolide
Mehmet Bakırdöğen Bey   ✅    ❌    ❌     ❌      ❌
Mehmet Maraş Bey        ✅    ✅    ✅     ✅      ✅
Fatih Lazoğlu Bey       ✅    ✅    ✅     ✅      ✅
Ahmet Esmeray Bey       ✅    ✅    ✅     ✅      ✅
Fatih Bey (Konya)       ❌    ❌    ❌     ✅      ❌
```

Mantık:
- **Çekirdek Halka (3 ortak):** MESA + ELMOS'un direkt ortakları (Mehmet Maraş,
  Fatih Lazoğlu, Ahmet Esmeray). MESA üzerinden MEBA ve ARKON'un dolaylı pay
  sahibi → 4 firmayı görür + konsolide.
- **Dış Halka (2 yönetici):** Mehmet Bakırdöğen (sadece MEBA), Konya Fatih Bey
  (sadece ARKON). Konsolide görmez.

Auth: array claim `firmaIzin: FirmaId[]`. Mock auth (kullanıcı seçici dropdown)
ile geliştir; gerçek auth (Cloudflare Access / Clerk / Supabase) sonra.

Bu yapı **zaten kodda hazır:** `src/data/kullanicilar.ts`, `src/data/firmalar.ts`,
`src/hooks/useAuth.ts`, `src/types/domain.ts`.

## Sayfa yapısı

### 1. `/nabiz` — Nabız
**Amaç:** "Firmanın bugün nasıl?" — 5 saniyede özet.

- **Üst bant:** Aktif firma adı + logo placeholder + son güncelleme zamanı
- **KPI grid (6 kart):** Yıllık Ciro · Brüt Marj · Net Kar · Açık Alacak ·
  Açık Borç · Nakit. Her kartta:
  - Büyük sayı (Framer Motion ile sayar)
  - 12 ay sparkline (Recharts)
  - YoY % değişim (renkli rozet)
- **AI yorum kartı:** Anadolu iş dili, 3-4 cümle. Örnek:
  > "Mehmet Bey, geçen aya göre cironuz %4 arttı ama brüt marjınız 1.8 puan
  > eridi. SMC pnömatik hattında maliyet baskısı görünüyor — bayiyle
  > pazarlık vakti gelmiş olabilir. ELMOS'a sevkiyatlar geçen yılın aynı
  > dönemine göre %18 yukarıda; ilişki güçlü gidiyor."
  - Vurguda **renkli rozet** (yeşil iyileşme / amber dikkat / kırmızı uyarı)
- **Hızlı eylemler:** "Para Haritasına git" / "90 günü göster" / "Bilançoyu aç"

### 2. `/para-haritasi` — Para Haritası
**Amaç:** Para nereden geliyor, nereye gidiyor, hangi kategoride marj eriyor.

- **Üst:** Yıl seçici + dönem karşılaştırma (önceki yıl ile)
- **Sankey diyagramı:** Gelir kategorileri → Brüt Kar → Faaliyet Karı → Net Kar
- **İki sütunlu liste:**
  - **Gelir kategorileri** (yatay bar, oran %, trend ok)
  - **Gider kategorileri** (yatay bar, oran %, trend ok)
- **Marj erozyon paneli:** Hangi kategoride brüt marj düşmüş?
  - Tablo: Kategori · Geçen yıl marj · Bu yıl marj · Δ puan · Tutar etkisi
  - Tıklanınca → Cari Detay sayfasına o kategori filtresiyle git

### 3. `/yarin-90-gun` — Yarın 90 Gün
**Amaç:** Önümüzdeki 3 ay nakit girişi/çıkışı + risk noktaları + simülasyon.

- **Üst KPI:** Bugün nakit · 30 gün sonra (tahmin) · 60 gün · 90 gün (renkli;
  kırmızı = negatif olur)
- **Takvim grid:** 13 haftalık ısı haritası — her gün için net nakit (mavi
  artı, kırmızı eksi). Tıklanan günün detay paneli açılır:
  - Girişler tablosu (tahsilat: cari, tutar, kaynak fatura)
  - Çıkışlar tablosu (ödeme: kime, tutar, kaynak fatura/vergi/SGK)
- **Akıllı uyarılar:**
  - "12 Haziran'da SGK + KDV ödemesi 1.2M ₺. O hafta tahsilat 480k ₺. ELMOS
    bakiyesi (640k ₺) vade geliyor — Fatih Bey'e hatırlatma."
- **Senaryo simülasyonu (panel):**
  - Slider 1: "Tahsilat hızı" (-30% ... +30%)
  - Slider 2: "Yeni alım askıya alınırsa"
  - Slider 3: "Tek seferlik vergi ertelemesi"
  - Sağda yeniden hesaplanan eğri animasyonla güncellenir

### 4. `/cari-detay` — Cari Detay
**Amaç:** Drill-down: yüksek seviye KPI'dan tek fatura kalemine kadar.

Hiyerarşi: **KPI → Kategori → Cari → Fatura → Kalem**

- **Sol kenar:** ağaç görünüm (kategori → cari)
- **Sağ ana alan:** seçilen seviyenin özeti
- **Üst breadcrumb:** Nabız ▸ Ciro ▸ SMC Pnömatik ▸ ELMOS Otomasyon ▸
  FT-2026-1003 ▸ 1/8" silindir
- Her seviye için:
  - **KPI:** Toplam ciro, açık bakiye, ortalama vade gün, son ödeme tarihi
  - **Tablo:** alt kalemler (sıralama, filtre, arama)
  - **Yan grafik:** son 12 ay ciro
- **Cari kartı modal:** unvan, vergi no, lokasyon, açık bakiye, vade analizi
  (0-30 / 31-60 / 61-90 / 90+), notlar (manuel yazılır — defter mantığı)

### 5. `/mali-tablo` — Mali Tablo
**Amaç:** Klasik bilanço + gelir tablosu, ama elden geçirilmiş.

- **Tab 1: Bilanço**
  - İki sütun: Aktif | Pasif (toplam eşitliği üstte göster)
  - Accordion (Dönen Varlıklar / Duran Varlıklar / KV Yabancı / Öz Kaynaklar)
  - Her satırda: tutar · Δ önceki dönem · oran %
- **Tab 2: Gelir Tablosu**
  - Şelale grafiği (Net Satışlar → SMS → Brüt Kar → ... → Net Dönem Karı)
  - Liste görünüm + grafik toggle
- **Dönem seçici:** Yıllık / Çeyrek / 12 ay yuvarlanan
- **PDF dışa aktarma butonu** (henüz dummy, "yakında" rozeti)

## Çekirdek 3 ortak için EK 2 sayfa

### `/konsolide` — Konsolide Grup Paneli (sadece çekirdek halka)

- **Üst:** 4 firma KPI satırı (her firma için mini kart) — kart hover'da o
  firmanın Nabız sayfasına derin link
- **Toplam grup KPI:** Toplam ciro (grup içi düşülmüş) · Toplam brüt kar ·
  Toplam net kar · Toplam alacak · Toplam borç · Toplam nakit
- **Grup içi mutabakat tablosu:** Hangi firma diğerine ne kadar borçlu (matris)
  - Renk: yeşil = denge, amber = >30 gün vade, kırmızı = >60 gün
- **Konsolide gelir tablosu** (grup içi alış-satış otomatik düşülmüş)

### `/is-gelistirme` — Grup İçi İş Geliştirme (TÜM 5 kullanıcıya açık)

> Bu sayfa **finansal değil**. Mehmet Bakırdöğen Bey ARKON'un cirosunu görmez
> ama Konya'da hangi sektörde aktif olduğunu görür — pnömatik fırsat
> değerlendirebilsin diye.

- **Çapraz fırsat panosu:** "MEBA → ARKON: Konya'da yeni edilmiş müşteri,
  pnömatik talebi var mı?" (kart bazlı, manuel girilebilir)
- **Ortak müşteri haritası:** Aynı müşteri 2+ firmadan alıyor mu? (basit
  liste + filtre)
- **Ortak proje takip:** Büyük projede 3-4 firma birlikte çalışıyor mu
- **Tedarikçi havuzu:** SMC/Lenze/Phoenix paylaşımlı iskonto notları
- **Yönlendirme defteri:** "12 May · MEBA Konya işi → ARKON'a yönlendirildi
  (Ahmet Bey)" — manuel kayıt akışı

## Navigasyon

- **Sol sidebar:**
  - Üstte: aktif kullanıcı kartı (avatar + isim + hitap)
  - Aktif firma seçici (sadece `firmaIzin` listesi gösterilir; tek firma
    yöneticisinde dropdown yok, sabit gösterim)
  - Sayfa linkleri: Nabız · Para Haritası · 90 Gün · Cari Detay · Mali Tablo
  - Ayraç
  - (Çekirdek için) Konsolide · İş Geliştirme
  - (Herkese) İş Geliştirme — eğer çekirdek değilse bu tek ek link
- **Sağ üst:** tema toggle (koyu/açık), kullanıcı geçişi (geliştirme için)

## Mock data

`src/data/mock-finans.ts` zaten hazır. İçerikleri grafiklere/tablolara bağla.
12 ay aylık KPI, gelir/gider kategorileri (örnek cariler dahil), 90 gün nakit
takvimi, top 5+ cari (alacak/borç + örnek fatura + örnek kalem), bilanço,
gelir tablosu — 4 firmanın hepsi için var.

## KATİ kurallar

1. **Hitabet:** Her kullanıcıya "Bey" eki ile hitap. UI başlığında, AI
   yorumunda, dropdown'da, log'larda istisnasız. ❌ "Ahmet" ✅ "Ahmet Bey".
2. **Audit log / denetim / izleme sayfası YASAK.** Ortak girişlerinin kaydı
   tutulup paylaşılmaz. "Şeffaflık için kayıt" yaklaşımı bu projede yanlış.
3. **Yabancı kültür terimleri YASAK.** guanxi, horenso, omotenashi, kaizen,
   wabi-sabi vb. asla kullanılmaz — ne UI'da, ne AI çıktısında, ne kod
   yorumunda. Türkçe karşılıklar: "ilişki defteri", "haber tablosu", "sürekli
   iyileştirme".
4. **Türkçe iş dili — Anadolu tonu.** AI yorum üretirken "el sıkışmak",
   "söz", "mutabakat", "hatır", "denge", "bereket" gibi yerel kavramlar
   uygundur. Yapay/akademik dil değil.
5. **MEBA'ya özel atıf yok** — 4 firmadan biri MEBA, ama "MEBA Komuta
   Merkezi" gibi başka bir programın atfı YASAK. Bu bağımsız bir yazılımdır.
6. **Çift "Mehmet Bey" / "Fatih Bey":** kafa karışmasın diye soyadıyla
   ayrıştır (Mehmet Maraş Bey, Mehmet Bakırdöğen Bey).
7. **noUncheckedIndexedAccess uyumu:** array index'leri için `!` veya
   guard kullan. `kayit[i]?.alan` veya `kayit[i]!.alan`.

## Tonlama örnekleri (AI yorum)

✅ "Fatih Bey, ELMOS'un Mayıs cirosu 3.4M ₺ ile geçen yılın aynı ayına
göre %16 yukarıda. Ama açık alacaklarınız 4.8M ₺'ye çıktı — vade defteri
sıkışmaya başlamış. Hatırlatma yapacağınız 3 büyük cari var."

✅ "Mehmet Bey, MEBA'nın bu çeyrek marjı 1.8 puan eridi. SMC ithalat
maliyetleri kur farkıyla yukarı çıkmış — fiyat listesini güncellemenin
sırası gelmiş olabilir."

❌ "Quarterly performance shows YoY growth..."
❌ "Guanxi tablonuzda 3 yeni cari eklendi..."
❌ "Mehmet, dikkat..."

## Geliştirme öncelik sırası

1. **Layout + sidebar + kullanıcı/firma seçici** (mock auth UI)
2. **Nabız sayfası** (KPI grid + sparkline + AI yorum kartı)
3. **Para Haritası** (gelir/gider listeler + marj erozyon)
4. **Mali Tablo** (bilanço + gelir tablosu accordion)
5. **Yarın 90 Gün** (nakit takvim + simülasyon)
6. **Cari Detay** (drill-down — en karmaşık, sona bırak)
7. **Konsolide + İş Geliştirme** (çekirdek için ek katmanlar)

Her sayfa bitince Framer Motion ile mikro animasyonları geçir, sonra bir
sonrakine geç. Önce işleyiş, sonra cila — ama estetik düşüşe izin verme.
