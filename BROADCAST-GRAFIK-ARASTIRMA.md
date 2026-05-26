---
name: reference-broadcast-grafik-arastirma-2026-05-26
description: Dünya çapı broadcast quality (Bloomberg/CNBC/Apple Keynote) grafik+animasyon lib araştırması; grup-sirketleri-finans-paneli için top 10 must-have
metadata: 
  node_type: memory
  type: reference
  originSessionId: c1d2062d-11f6-473b-86c0-0f5d4b78a684
---

# Broadcast Quality Grafik + Animasyon Araştırması
**Proje:** `grup-sirketleri-finans-paneli` (MESA + MEBA + ELMOS + ARKON yöneticilerine finans paneli)
**Tarih:** 2026-05-26
**Stack:** Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Framer Motion + TanStack Router
**Vizyon:** Bloomberg Terminal + CNBC ticker tape + Apple Keynote reveal + Linear kurumsal polish

---

## 1. Yönetici Özet

Mehmet Bey'in "havalı + kurumsal" denge vizyonu için tek bir lib yetmez; **3 katmanlı stack** kuruyoruz: (1) **Veri viz** için Visx + Tremor + Lightweight Charts kombinasyonu (custom freedom + hızlı dashboard + finans-spesifik performans), (2) **Sinema-level motion** için GSAP (artık 100% ücretsiz Webflow desteğiyle) + mevcut Framer Motion'ı koruma, (3) **Broadcast micro-pattern**'ler için CountUp + react-fast-marquee + Lottie + react-globe.gl. Toplam bundle ~250 KB gzipped, hepsi MIT, React 19 + Vite uyumlu. Türk finansal platformların (Matriks IQ / Bloomberg HT / ParamTürk) görsel seviyesini katbekat aşacak çünkü onlar `2010 stil terminal` paradigması, bizimki `2026 magazine + broadcast` paradigması.

---

## 2. TOP 5 MUST HAVE — Olmazsa Olmaz

### MUST #1 — **GSAP (GreenSock Animation Platform)**
- **URL:** https://gsap.com/ · GitHub: greensock/GSAP (Webflow org)
- **Pattern:** Sinematik timeline, kompleks reveal sequence, ticker entrance, chart draw-on animation, ScrollTrigger (Bloomberg/Tesla Investor Day tarzı)
- **Lisans:** **2024 Webflow acquisition sonrası 100% ÜCRETSİZ ticari kullanım dahil** — eski "Club GreenSock" plugin'leri (SplitText, MorphSVG, DrawSVG) de artık ücretsiz
- **Bundle:** Core ~28 KB gzipped (plugin'ler ayrı tree-shake)
- **React 19 + Vite:** Tam uyumlu (`useGSAP` hook'u var)
- **Broadcast skoru:** **10/10** — endüstri standardı; Apple, Nike, NYT, Awwwards kazananlarının %80'i kullanıyor
- **Entegrasyon:** Orta (4-6 saat — timeline mantığını öğrenmek)
- **Gerçek kullanım:** Apple keynote websiteleri, Tesla Cybertruck reveal, NYT data scrollytelling, Stripe homepage
- **NEDEN:** Framer Motion declarative ve hızlı ama "mil-saniye precision" + "20 element koreografi" gerektiren broadcast reveal'lar için GSAP timeline'a alternatif yok. GSAP + Framer Motion bir arada yaşar (GSAP = setup, Framer = state).

### MUST #2 — **Visx (Airbnb)**
- **URL:** https://airbnb.io/visx/ · https://visx.airbnb.tech/
- **Pattern:** Custom finansal grafik (Sankey para akışı, Sunburst grup hiyerarşi, Treemap firma payı), 0-pixel-control "Apple Keynote chart" tarzı
- **Lisans:** MIT (Airbnb open source)
- **Bundle:** ~15 KB modular import (her chart paketi 2-5 KB)
- **React 19 + Vite:** Native uyumlu, SSR friendly
- **Broadcast skoru:** **9/10** — düşük seviye D3 primitive, jenerik chart yok, her şey bespoke
- **Entegrasyon:** Orta-zor (6-10 saat — D3 mental model gerekir)
- **Gerçek kullanım:** Airbnb, NYT, FT (custom interactive grafikler), Stripe Press, Robinhood eski versiyon
- **NEDEN:** "Recharts gibi sıkıcı görünme" istemiyoruz. Visx ile Sankey para akışı'nı tam istediğimiz renkte / animasyonda / etiketleme ile çizeriz. GSAP timeline'ı Visx'in SVG path'lerine bağlanır → broadcast quality draw-on.

### MUST #3 — **Tremor (Vercel)**
- **URL:** https://tremor.so/
- **Pattern:** Hızlı production-ready chart card'ları (KPI grid, sparkline, area chart, donut), shadcn/ui ile mükemmel uyum
- **Lisans:** Apache 2.0 + bazı bloklar ticari (35+ component ücretsiz, 300+ block ücretsiz)
- **Bundle:** Tree-shake ~40 KB (Recharts altyapı)
- **React 19 + Vite + Tailwind v4:** **Vercel 2025'te Tremor'ı satın aldı**, Tailwind v4 + React 19 uyumlu olarak yeniden yazıldı
- **Broadcast skoru:** **7/10** — broadcast değil ama "Linear kalitesi production dashboard" tam karşılıyor; GSAP reveal eklendiğinde 9'a çıkar
- **Entegrasyon:** Kolay (2-3 saat — copy-paste)
- **Gerçek kullanım:** Vercel internal, Linear analytics, modern SaaS dashboard'ları
- **NEDEN:** Sayfaların %60'ı (Nabız, KPI tile'ları, ufak sparkline'lar) için Visx custom yapmak overkill. Tremor ile 1 günde tüm grid kurulur, sonra hot-spot'larda Visx + GSAP devreye girer.

### MUST #4 — **TradingView Lightweight Charts**
- **URL:** https://www.tradingview.com/lightweight-charts/ · https://github.com/tradingview/lightweight-charts
- **Pattern:** Cari hesap akış grafikleri, 50K+ data point smooth render, candlestick/area/baseline (finans-spesifik)
- **Lisans:** Apache 2.0
- **Bundle:** **45 KB** (Canvas-based, ekstra hafif)
- **React 19 + Vite:** Tam uyumlu (`createChart` API + useEffect)
- **Broadcast skoru:** **8/10** — TradingView'ın kendi terminal'i bu lib ile çalışıyor, finansal time-series'in altın standardı
- **Entegrasyon:** Kolay-Orta (3-4 saat)
- **Gerçek kullanım:** TradingView, Binance, Coinbase Advanced, Bloomberg watchlist alt grafikler
- **NEDEN:** Cari Detay sayfasında "12 aylık bakiye akışı" gibi finans-tipik grafikler için bu lib SVG-based alternatiflere göre 10x daha hızlı. Türk borsa app'larının görsel seviyesini tek başına aşar.

### MUST #5 — **react-countup (+ CountUp.js Odometer plugin)**
- **URL:** https://www.npmjs.com/package/react-countup · https://github.com/glennreyes/react-countup
- **Pattern:** "Sayı dansı" — 0 → 1.847.230 TL animasyonu, KPI tile'ları, mali tablo reveal, lower-third numbers
- **Lisans:** MIT
- **Bundle:** ~3 KB (countup.js: 2 KB + wrapper)
- **React 19 + Vite:** Native uyumlu, hooks API var
- **Broadcast skoru:** **9/10** — Bloomberg/CNBC alt yazı sayı sayma efektinin birebir karşılığı; **Odometer plugin** ile mekanik kasa hissi
- **Entegrasyon:** Çok kolay (30 dk)
- **Gerçek kullanım:** Apple ürün lansman sayfaları, Stripe metrics, Linear changelog, Crunchbase
- **NEDEN:** Mehmet Bey vizyonunun en görünür parçası "sayılar danslıyor" hissi. Her KPI'da, her toplam'da bu lib olmalı. Üstüne Framer Motion `whileInView` ile viewport entrance → broadcast hissi.

---

## 3. TOP 5 OPSİYONEL — Gerekirse Eklenir

### OPS #1 — **Apache ECharts**
- **URL:** https://echarts.apache.org/
- **Pattern:** Geo harita (Türkiye il bazlı satış), Sankey, Sunburst, Calendar heatmap, Gauge, 3D bar
- **Lisans:** Apache 2.0
- **Bundle:** ~100 KB gzipped (tree-shake mümkün)
- **React 19 + Vite:** `echarts-for-react` wrapper var (veya direkt ref)
- **Broadcast skoru:** **8/10** — Çin'de Alibaba/Baidu, dünyada Apache Foundation; broadcast-grade gauge ve Sankey'ler
- **Entegrasyon:** Orta (5-7 saat — config object öğrenmek)
- **Gerçek kullanım:** Alibaba, AWS Console, GitLab analytics, Apache Superset
- **NE ZAMAN:** Türkiye il bazlı satış haritası, ısı kalendarı (günlük cari hareket), Gauge speedometer (4 firma karşılaştırma) gerektiğinde tek seferde devreye gir.

### OPS #2 — **Lottie React (lottie-react)**
- **URL:** https://lottiefiles.com/ · npm: lottie-react
- **Pattern:** Loading state, success animation, micro-interaction icon, empty state, AE export
- **Lisans:** MIT (lottie-react wrapper), LottieFiles free tier
- **Bundle:** ~60 KB (lottie-web runtime)
- **React 19 + Vite:** Tam uyumlu
- **Broadcast skoru:** **8/10** — designer + dev arası altın köprü; her ikon Apple kalitesinde animate olabilir
- **Entegrasyon:** Kolay (1 saat)
- **Gerçek kullanım:** Airbnb, Disney+, Google, Uber, Duolingo (her uygulamada)
- **NE ZAMAN:** İkonlar konuşmaya başladığında (favori toggle, başarı tick'i, brand mark intro). 2025'te dotLottie state machine eklendi, Rive'ı yakaladı.

### OPS #3 — **Rive (rive-react)**
- **URL:** https://rive.app/
- **Pattern:** Interactive state machine (hover/click ile karakteri yönlendir), 60 FPS canvas
- **Lisans:** MIT runtime; Rive Editor free tier
- **Bundle:** ~200 KB gzipped (WASM)
- **React 19 + Vite:** Tam uyumlu (`@rive-app/react-canvas`)
- **Broadcast skoru:** **9/10** — Lottie'den 3-4x daha performant (60 FPS vs 17 FPS), gerçek interaktif
- **Entegrasyon:** Orta (4-5 saat — Rive Editor öğrenme eğrisi)
- **Gerçek kullanım:** Figma, Duolingo (yeni karakterler), Cred (Hindistan fintech)
- **NE ZAMAN:** Eğer dashboard'a bir maskot/karakter (örn. AI asistan avatar) eklenirse Lottie yerine Rive seç.

### OPS #4 — **react-fast-marquee**
- **URL:** https://www.react-fast-marquee.com/
- **Pattern:** CNBC alt akan şerit (ticker tape) — döviz/altın/borsa fiyatları, grup haberleri
- **Lisans:** MIT
- **Bundle:** ~5 KB
- **React 19 + Vite:** Tam uyumlu (CSS transform-based, GPU accelerated)
- **Broadcast skoru:** **9/10** — birebir CNBC/Bloomberg ticker hissi
- **Entegrasyon:** Çok kolay (15 dk)
- **Gerçek kullanım:** 204K weekly download, 1170+ GitHub yıldız, Linear changelog ticker, Vercel partner logos
- **NE ZAMAN:** Anasayfa üstünde **mutlaka** olmalı — döviz/altın/4 firma günlük net hareket, sürekli akan canlı veri.

### OPS #5 — **Cobe (Vercel 3D Globe)**
- **URL:** https://cobe.vercel.app/ · https://github.com/shuding/cobe
- **Pattern:** 3D küre — Türkiye haritası noktalı, 4 firma lokasyonu, ihracat varış noktaları, tedarikçi konumları
- **Lisans:** MIT
- **Bundle:** **5 KB** (3D küre için inanılmaz)
- **React 19 + Vite:** Tam uyumlu (canvas ref + useEffect)
- **Broadcast skoru:** **9/10** — Vercel homepage'in ikonik globe'u; Bloomberg "World" sayfasının modern karşılığı
- **Entegrasyon:** Kolay (2 saat)
- **Gerçek kullanım:** vercel.com, vercel.com/edge, Linear marketing, Resend, Cal.com
- **NE ZAMAN:** Anasayfa hero bento'sunda "Grup Dünya Ağı" tile'ı veya İhracat sayfasında. react-globe.gl daha feature-rich ama 200+ KB, Cobe ile başlanır.

---

## 4. Spesifik Sayfa Önerileri

### **Nabız Sayfası** (anasayfa, 4 firma anlık özet)
- **Üst şerit:** `react-fast-marquee` ile döviz/altın/4 firma günlük net + sektör haberi (ticker tape)
- **KPI grid (4 firma × 4 metrik):** `Tremor Card` + `react-countup` (sayı dansı) + `Visx Sparkline` (mini trend)
- **Reveal:** GSAP `stagger` ile kartlar 50 ms aralıkla in
- **Pattern:** Bloomberg watchlist + Apple keynote big number

### **Para Haritası** (grup içi cari mutabakat görseli)
- **Ana grafik:** `Visx Sankey` (custom çiz, render kontrolü tam) — MESA → MEBA, ELMOS → MESA gibi akışlar
- **Animasyon:** GSAP `motionPath` ile akışı görselleştir; **renkli partikel** akışı (Visual Capitalist tarzı)
- **Tooltip:** Tremor card popover + react-countup tutar
- **Alternatif:** Nivo Sankey hızlı başlangıç için (sonra Visx'e geç)
- **Pattern:** Visual Capitalist "Government Spending" + Apple "Privacy Flow"

### **Yarın 90 Gün** (alacak/borç vade haritası, gelecek nakit projeksiyonu)
- **Grafik:** `TradingView Lightweight Charts` baseline series (sıfır = today, üst = pozitif nakit, alt = açık)
- **Bloomberg trade flow:** Üstte **GSAP timeline** ile gün gün yürüyen indicator; ECharts gauge sağda "30/60/90 gün risk"
- **Renkli akış:** Visx motion `Bar` ile vade kova'ları (7gün, 15gün, 30gün, 60gün, 90+); her bar GSAP `ease: power3.out` ile yükselir
- **Pattern:** Bloomberg Terminal "Yield Curve" + TradingView depth chart

### **Cari Detay** (tek müşteri/tedarikçi sayfası)
- **Lower-third:** Üstte sticky banner — firma adı + bakiye + risk skoru (CNBC sunucu alt 1/3'ü)
- **Lower-third animasyonu:** GSAP `SplitText` ile firma adı harf harf gelir, react-countup ile bakiye dans eder
- **Mini grafik:** `Visx Sparkline` (12 aylık bakiye trend), `Tremor BarList` (en büyük 5 fatura)
- **Hareket tablosu:** `TanStack Table` + her satıra react-countup TL tutarı
- **Pattern:** Bloomberg ticker page + Robinhood detail view

### **Mali Tablo** (gelir tablosu / bilanço karşılaştırma)
- **Tesla Investor Day reveal:** Sayfa scroll'da GSAP ScrollTrigger ile her satır sırayla flash + react-countup büyük rakam reveal
- **Karşılaştırma kartı:** 4 firma yan yana, **CountUp Odometer plugin** ile mekanik kasa hissi
- **Trend:** `Visx LinePath` ile 24 ay trend, GSAP draw-on (path length animate)
- **3D vurgu:** Önemli sayılarda Framer Motion 3D rotate + GSAP ease, "boom" hissi
- **Pattern:** Apple Q4 Earnings page + Tesla 2030 Master Plan reveal

### **Ülke/Dünya Haritası** (varsa ihracat sayfası)
- **Globe:** `Cobe` ile rotate eden Türkiye + ihracat hattı noktası
- **Lottie ikon:** Her ülkeye landing'de hover animasyonu
- **Pattern:** Vercel Edge Network haritası

### **AI Brief Anasayfa Bölümü**
- **Background loop:** `Lottie React` ile minimal dalgalanan dalga (AI nefes alıyor)
- **Metin reveal:** GSAP `TextPlugin` ile typewriter (kontrollü, çok hızlı değil)
- **Pattern:** Granola summary card + Notion AI

---

## 5. Lovable Prompt için Snippet

```
GÖRSEL + ANIMASYON STACK (KATİ):

Mevcut: Framer Motion + Recharts (Lovable default)
EKLE:
- gsap (timeline, ScrollTrigger, SplitText, draw-on — Webflow tarafından ücretsiz)
  npm: gsap
  React hook: @gsap/react useGSAP
- @visx/visx (custom finansal grafik — Sankey, Sunburst, Sparkline)
  Modular import: @visx/sankey, @visx/sparkline, @visx/shape
- @tremor/react (production dashboard component'leri, shadcn uyumlu)
- lightweight-charts (TradingView financial canvas, 50K+ point smooth)
- react-countup (KPI sayı dansı animasyonu — Bloomberg style)
- react-fast-marquee (üst şerit ticker tape — CNBC style)
- cobe (5KB 3D globe — Vercel style)
- lottie-react (micro-interaction icons + AI brief background)

KULLANIM POLİTİKASI:
1. Recharts kullanma — ya Tremor (hızlı) ya Visx (custom) ya Lightweight Charts (finansal)
2. Her KPI'da react-countup zorunlu — düz sayı YASAK
3. Sayfa giriş animasyonu GSAP timeline + Framer Motion layout
4. Üst şerit: anasayfa + nabız sayfalarında react-fast-marquee mecburi
5. Tüm sayfalar: Bloomberg/CNBC kalitesi reveal; "sıradan dashboard" YASAK
6. Animasyon hızı: aşırıya kaçma — easeOutQuart, 400-800ms, prefers-reduced-motion respect
7. Türkçe sayı formatı: tr-TR locale (1.234.567,89), TL/EUR/USD switcher

HEDEF: Matriks IQ + Bloomberg HT + ParamTürk görsel kalitesini geçmek;
Linear kurumsal polish + CNBC broadcast canlılığı; Apple Keynote reveal hissi.
```

---

## 6. Bütçe — Lisans + Öğrenme + Entegrasyon

| Lib | Lisans Maliyeti | Öğrenme Süresi | İlk Entegrasyon | Toplam İlk Yatırım |
|---|---|---|---|---|
| GSAP | 0 TL (Webflow ücretsiz) | 4-6 saat | 6 saat | **10-12 saat** |
| Visx | 0 TL (MIT) | 6-8 saat (D3 mantığı) | 10 saat | **16-18 saat** |
| Tremor | 0 TL (Apache) | 1-2 saat | 4 saat | **5-6 saat** |
| Lightweight Charts | 0 TL (Apache) | 2-3 saat | 4 saat | **6-7 saat** |
| react-countup | 0 TL (MIT) | 30 dk | 1 saat | **1.5 saat** |
| ECharts (ops) | 0 TL (Apache) | 4 saat | 6 saat | **10 saat** |
| Lottie React (ops) | 0 TL + LottieFiles free | 1 saat | 2 saat | **3 saat** |
| react-fast-marquee | 0 TL (MIT) | 15 dk | 30 dk | **45 dk** |
| Cobe (ops) | 0 TL (MIT) | 1 saat | 2 saat | **3 saat** |
| Rive (ops, sadece gerekirse) | 0 TL runtime | 6 saat (editör) | 4 saat | **10 saat** |

**Toplam ilk kurulum (TOP 5):** ~40 saat (1 sprint = 1 hafta yoğun)
**Toplam bundle ekstra:** ~250 KB gzipped (modern CDN'de < 1 sn yükleme)
**Lisans maliyeti:** **0 TL** — hepsi açık kaynak
**Yıllık maliyet:** **0 TL** (LottieFiles team plan tercihen $25/ay opsiyonel)

**ROI:** Ortaklara ilk demoda "vay canına" hissi → yatırım kararı + 4 firma adoption hızlanır. Mehmet Bey vizyonunun direkt karşılığı.

---

## 7. Türkiye Gerçek Dünya Örneği — Görsel Kalite Karşılaştırma

### **Bloomberg HT** ([bloomberght.com](https://www.bloomberght.com/))
- **Görsel paradigma:** TV-news layout, üstte canlı ticker (var ama statik fontlu), büyük headline magazine
- **Animasyon:** Minimal — Foreks veri tablosu klasik HTML, ticker CSS marquee
- **Skor:** 6/10 — yaygın ama broadcast değil, "news website" seviyesi
- **Bizim avantajımız:** GSAP + react-fast-marquee + Tremor card'larla 10x daha canlı

### **Matriks IQ / Matriks Prime** ([matriksdata.com](https://www.matriksdata.com/))
- **Görsel paradigma:** Klasik trader terminal — siyah bg, monospace font, çoklu pencere
- **Animasyon:** Yok denecek kadar az; "veri yoğun, görsel az" tasarım felsefesi
- **Skor:** 5/10 — fonksiyonel ama 2010 estetiği; Türkiye'nin lideri ama görsel olarak modern değil
- **Bizim avantajımız:** Bambaşka paradigma — magazine + broadcast; trader'a değil **yöneticiye** hitap; Linear + Stripe seviye polish

### **ParamTürk** ([param.com.tr](https://www.param.com.tr/))
- **Görsel paradigma:** Modern card-based, hafif animasyon, mobil-first
- **Animasyon:** Standart CSS transition'lar; Framer Motion seviyesi yok
- **Skor:** 7/10 — Türkiye'nin görsel olarak en modern fintech'i; ama yine de "uygulama" hissi, "broadcast" değil
- **Bizim avantajımız:** GSAP timeline + Visx custom + Cobe globe ile **bir adım sonra**

### **Foreks** ([foreks.com](https://www.foreks.com/))
- **Görsel paradigma:** Veri terminal + haber portalı hibrit
- **Animasyon:** Minimal
- **Skor:** 5/10
- **Bizim avantajımız:** Tartışmasız (zaten kıyas olmuyor)

### **Hedef konum (bizim):** **9-10/10**
- Tesla 2030 Master Plan reveal + Apple Q4 Earnings page + Stripe Press + Linear Changelog seviyesi
- Türkiye'de **HİÇBİR** finansal platform bu seviyede değil — açık fırsat alanı
- Mehmet Bey'in "kurumsallık + havalı" denge vizyonunun teknolojik karşılığı

---

## 8. Stack Tarafından Atlanan Tehlikeler

- **GSAP & React 19 useGSAP:** Strict Mode'da double-invoke; `useGSAP` hook'u bunu çözer (context-aware cleanup)
- **Visx React 19:** Henüz Server Components'a tam destek yok; client component olarak işaretle (`'use client'`)
- **Tremor v4 + Tailwind v4:** Sınıf adları @theme directive ile yönetiliyor; v3 → v4 geçişte renk token'larını OKLCH'e taşı
- **Lightweight Charts Strict Mode:** `createChart` ref'i dispose'a dikkat — useEffect cleanup şart
- **react-countup viewport trigger:** `enableScrollSpy: true` mobile'da Intersection Observer fallback test et
- **Cobe + Strict Mode:** Çift initialize'a dikkat, ref guard
- **Bundle target:** Hepsi birlikte ~250 KB → Vite manualChunks ile vendor split; CDN edge cache zorunlu

---

## 9. Lib Karşılaştırma Tablosu (Tek Bakışta)

| Lib | Tür | Bundle | Lisans | React 19 | Broadcast | Zorluk | Karar |
|---|---|---|---|---|---|---|---|
| GSAP | Animasyon | 28 KB | MIT (free) | ✅ | 10/10 | Orta | **MUST** |
| Visx | Chart (low-level) | 15 KB | MIT | ✅ | 9/10 | Orta-Zor | **MUST** |
| Tremor | Chart (high-level) | 40 KB | Apache | ✅ | 7/10 | Kolay | **MUST** |
| Lightweight Charts | Chart (finans) | 45 KB | Apache | ✅ | 8/10 | Kolay-Orta | **MUST** |
| react-countup | Sayı | 3 KB | MIT | ✅ | 9/10 | Kolay | **MUST** |
| ECharts | Chart (her şey) | 100 KB | Apache | ✅ | 8/10 | Orta | **OPS** |
| Lottie React | Animasyon (asset) | 60 KB | MIT | ✅ | 8/10 | Kolay | **OPS** |
| Rive | Animasyon (interaktif) | 200 KB | MIT | ✅ | 9/10 | Orta | **OPS** |
| react-fast-marquee | Ticker | 5 KB | MIT | ✅ | 9/10 | Kolay | **OPS** |
| Cobe | 3D Globe | 5 KB | MIT | ✅ | 9/10 | Kolay | **OPS** |
| Motion One | Animasyon | 4 KB | MIT | ✅ | 7/10 | Kolay | Skip (Framer var) |
| Anime.js v4 | Animasyon | 17 KB | MIT | ✅ | 7/10 | Kolay | Skip (GSAP var) |
| Theatre.js | Timeline editor | 50 KB | Apache | ⚠️ R3F | 8/10 | Zor | Skip (overkill) |
| Plotly.js | Chart (scientific) | 3.6 MB | MIT | ✅ | 6/10 | Orta | Skip (çok büyük) |
| react-globe.gl | 3D Globe | 200+ KB | MIT | ✅ | 8/10 | Orta | Skip (Cobe yeter) |
| Highcharts | Chart | 100+ KB | Ticari | ✅ | 9/10 | Kolay | Skip (lisanslı) |
| AG Charts | Chart | 150 KB | MIT/Enterprise | ✅ | 8/10 | Orta | Skip (Tremor yeter) |
| Nivo Sankey | Sankey | 50 KB | MIT | ✅ | 7/10 | Kolay | Maybe (Visx'e alternatif başlangıç) |
| VChart (ByteDance) | Chart (storytelling) | 80 KB | MIT | ✅ | 8/10 | Orta | Maybe (TikTok stack) |
| Auto-Animate | List anim | 3 KB | MIT | ✅ | 5/10 | Çok kolay | Maybe (CRUD list'lerde) |

---

## 10. Kaynaklar (URL listesi)

### Chart Libraries
- Visx (Airbnb): https://airbnb.io/visx/ · https://visx.airbnb.tech/
- Nivo: https://nivo.rocks/sankey/
- Apache ECharts: https://echarts.apache.org/
- TradingView Lightweight Charts: https://www.tradingview.com/lightweight-charts/ · https://github.com/tradingview/lightweight-charts
- Tremor: https://www.tremor.so/ · https://npm.tremor.so/
- VChart (VisActor/ByteDance): https://visactor.io/vchart · https://github.com/VisActor/VChart
- Plotly.js: https://plotly.com/javascript/
- AG Charts: https://www.ag-grid.com/charts/
- Highcharts: https://www.highcharts.com/
- Recharts: https://recharts.org/

### Animation Libraries
- GSAP: https://gsap.com/ · https://webflow.com/blog/gsap-becomes-free
- Motion (ex-Framer Motion): https://motion.dev/
- Anime.js v4: https://animejs.com/
- Theatre.js: https://www.theatrejs.com/
- React Spring: https://www.react-spring.dev/
- Auto-Animate (FormKit): https://auto-animate.formkit.com/
- Lottie React: https://www.npmjs.com/package/lottie-react · https://lottiefiles.com/
- Rive: https://rive.app/

### Broadcast Patterns
- react-countup: https://github.com/glennreyes/react-countup
- use-count-up: https://github.com/vydimitrov/use-count-up · https://use-count-up.vercel.app/
- CountUp.js Odometer: https://www.npmjs.com/package/countup.js
- react-fast-marquee: https://www.react-fast-marquee.com/
- react-ticker: https://github.com/AndreasFaust/react-ticker
- react-sparklines: https://github.com/borisyankov/react-sparklines
- react-gauge-component: https://antoniolago.github.io/react-gauge-component/

### 3D + Globe + Map
- Cobe (Vercel): https://cobe.vercel.app/ · https://github.com/shuding/cobe
- react-globe.gl: https://www.npmjs.com/package/react-globe.gl · https://github.com/vasturiano/react-globe.gl
- Globe.gl: https://globe.gl/
- React Three Fiber: https://r3f.docs.pmnd.rs/
- DeckGL: https://deck.gl/

### Karşılaştırma Makaleleri
- Comparing React animation libraries 2026 (LogRocket): https://blog.logrocket.com/best-react-animation-libraries/
- GSAP vs Motion 2026: https://satishkumar.xyz/blogs/gsap-vs-motion-guide-2026
- Recharts vs Tremor vs Nivo 2026 (PkgPulse): https://www.pkgpulse.com/guides/recharts-v3-vs-tremor-vs-nivo-react-charting-2026
- Lightweight Charts vs ECharts: https://stackshare.io/stackups/echarts-vs-lightweight-charts
- Lottie vs Rive 2026: https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026 · https://unicornicons.com/learn/rive-vs-lottie

### Türkiye Finansal Platformlar
- Bloomberg HT: https://www.bloomberght.com/
- Matriks Data: https://www.matriksdata.com/
- Matriks Prime Terminal: https://www.matriksdata.com/website/urunlerimiz/kullanici-platformlari/matriks-prime-veri-terminali
- Foreks: https://www.foreks.com/
- ParamTürk: https://www.param.com.tr/

---

## 11. Bir Sonraki Aksiyon (Mehmet Bey için)

1. **Onay:** Bu TOP 5 MUST listesini Lovable prompt'a ekleyeyim mi? (5 dk)
2. **POC sayfa:** Önce "Nabız" sayfasında bu 5 lib'i kullanarak proof-of-concept yapayım mı? (1 gün)
3. **Lottie kütüphanesi:** LottieFiles üzerinden 4 firma için ufak brand mark animasyonu sipariş edilsin mi? (designer 1 hafta veya ücretsiz template)
4. **Demo:** İlk POC sonrası 4 ortağa "vay canına" demo — yatırım kararı katalizörü

**KATİ KURAL:** Bu stack ile çıkan ilk sayfa Matriks IQ'dan görsel olarak en az 3 seviye üstünde olmalı; aksi halde lib seçimi yanlış demektir, geri dön.
