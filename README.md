# Grup Şirketleri Finans Paneli

4 firma grubunun (MEBA + MESA + ELMOS + ARKON) yöneticilerine özel finansal
analiz paneli. Logo Go'dan otomatik veri çekimle çalışır; tek server MESA'da,
4 firma aynı kaynaktan beslenir.

> Bu program bağımsız bir yazılımdır — başka herhangi bir iç sistemden
> türetilmemiştir.

## Stack

- TanStack Start + Vite
- Tailwind CSS v4 + shadcn/ui + Tremor (dashboard polish)
- Framer Motion + GSAP (broadcast quality animasyon)
- Visx (Sankey + custom data viz) + TradingView Lightweight Charts (time-series)
- react-countup (CNBC tarzı sayı animasyonu)
- TypeScript (strict + noUncheckedIndexedAccess)

### Estetik
Bloomberg Terminal + CNBC ticker + Apple Keynote sinematik + Linear/Vision Pro
kurumsal polish. Her sayfada en az 1 broadcast moment (count-up KPI, chart
reveal, ticker tape, Sankey, lower-third). Detay: [BROADCAST-GRAFIK-ARASTIRMA.md](BROADCAST-GRAFIK-ARASTIRMA.md).

## Kurulum

```powershell
npm install
npm run dev
```

## Tek tikla baslatma

Windows'ta repo kokundeki `Start-Grup-Finans-Paneli.cmd` dosyasina cift tiklayin.
Bu baslatici otomatik olarak:

- GitHub'dan en guncel surumu ceker
- Gerekirse `npm install --legacy-peer-deps` calistirir
- `http://127.0.0.1:3000/` adresinde paneli baslatir
- Tarayicida otomatik acar

## Klasör yapısı

```
src/
├── types/domain.ts        # FirmaId, KullaniciId, Firma, Kullanici, FirmaFinans
├── data/
│   ├── firmalar.ts        # 4 firma seed + ortaklık matrisi
│   ├── kullanicilar.ts    # 5 kullanıcı + yetki/izin matrisi
│   └── mock-finans.ts     # Aylık KPI, para haritası, 90 gün nakit,
│                          # cari + fatura + kalem, bilanço, gelir tablosu
└── hooks/useAuth.ts       # Aktif kullanıcı + firma seçici (firmaIzin claim)
```

## Erişim matrisi

| Kullanıcı | MEBA | MESA | ELMOS | ARKON | Konsolide |
|-----------|:----:|:----:|:-----:|:-----:|:---------:|
| Mehmet Bakırdöğen Bey | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mehmet Maraş Bey       | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fatih Lazoğlu Bey      | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ahmet Esmeray Bey      | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fatih Bey (Konya)      | ❌ | ❌ | ❌ | ✅ | ❌ |

3 ortak (Mehmet Maraş + Fatih Lazoğlu + Ahmet Esmeray) "Çekirdek Halka" —
4 firmayı + konsolide grup panelini görür. Mehmet Bakırdöğen + Konya Fatih Bey
"Dış Halka" — sadece kendi firmalarını görür, konsolide yok.

## Sayfalar (MVP)

| Sayfa | Amaç |
|-------|------|
| **Nabız** | Şirket özet, KPI grid, AI yorum |
| **Para Haritası** | Gelir/gider kategorisi, marj erozyon analizi |
| **Yarın 90 Gün** | Nakit projeksiyon takvimi + senaryo simülasyonu |
| **Cari Detay** | KPI → kategori → cari → fatura → kalem drill-down |
| **Mali Tablo** | Bilanço + Gelir Tablosu |

Çekirdek 3 ortak için ek: **Konsolide Grup Paneli** + **Grup İçi İş Geliştirme**
katmanı (5 kullanıcının tamamına açık, finansal değil).

## Katı kurallar

- **Hitabet:** Mehmet/Yusuf/Furkan/Ahmet/Fatih **Bey** — çıplak ad asla
- **Denetim / izleme / audit log sayfası YASAK** — ortak güveni sözle pekişir
- **Yabancı kültür terimleri yasak** (guanxi/horenso/omotenashi vb.)
- **Türkçe iş dili:** Anadolu ticaret kültürü tonu (el sıkışmak, söz, mutabakat)

## Veri kaynağı

Şu an mock data ile çalışır. Logo Go bayisiyle entegrasyon görüşmesi sonrası
gece çalışacak Sync Agent kurulacak (bkz. [LOGO-GO-BAYI-BRIEF.md](LOGO-GO-BAYI-BRIEF.md)).

## Lovable

Lovable projesine yapıştırılacak detaylı tasarım promptu:
[LOVABLE-PROMPT.md](LOVABLE-PROMPT.md)
