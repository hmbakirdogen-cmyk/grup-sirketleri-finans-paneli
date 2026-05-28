# 📊 Grup Şirketleri Finans Paneli — HANDOFF (master state)

**Son güncelleme:** 2026-05-28 (CC + Mehmet Bey — düzen kurma turu)
**Repo:** `C:\Users\Admin\grup-sirketleri-finans-paneli` (MEBA Komuta Merkezi'nden **AYRI** program)
**Durum:** 13 sayfa canlı · gerçek MEBA verisi moduna geçildi · 1 commit'lenmemiş refactor bekliyor

> Yeni session'da **bu dosyayı ilk oku.** Sabit isim (`HANDOFF.md`) — tarih içeride, yol asla değişmez.

---

## ⚠️ KATİ KURALLAR (memory ile birebir — bozulmaz)

- **AYRI program:** Bu yazılım MEBA Komuta Merkezi'nin parçası DEĞİL. Ayrı repo + ayrı deploy + ayrı Lovable. (`feedback_grup_finans_ayri_program`)
- **"Lens" adı YASAK.** Proje adı: `grup-sirketleri-finans-paneli`.
- **Editorial Press dili:** Playfair Display + DM Sans + krem zemin + serif rakam. Dark glass / neon / jenerik 3D YASAK. Bloomberg Businessweek / Monocle / WSJ Weekend prestiji. (`feedback_editorial_press_dili`)
- **3D grafik stili her yerde:** Chart3DBackdrop + shadow copy line + glow + multi-stop gradient + 3D progress bar. Sayı kısaltma YASAK — `30.605.000 ₺` tam Türkçe format. (`feedback_3d_grafik_stili_kati`)
- **MESA kırmızı:** Firma kimlik renkleri → MEBA cyan / MESA #dc2626 kırmızı / ELMOS yeşil / ARKON amber. Aktif firma → CSS var `--accent`. (`feedback_mesa_kirmizi`)
- **V1 muhasebe sınırı:** V1 yalnızca Logo Go'dan çekilebilir veri + muhasebeci manuel yükleme. Ekstra modül yok; var olanda harikalar yaratılır. İş Birliği / AI sohbet → **V2 rozeti**. (`feedback_v1_muhasebe_sinir`)
- **Ortak güveni > kontrol:** Audit / log / denetim / izleme sayfası YASAK. Güven sözle pekişir. (`feedback_ortak_guveni_kati`)
- **Hitabet:** Daima "[Soyad] Bey" — çıplak ad asla. (`feedback_hitabet_bey`)
- **Yabancı kültür terimleri yasak** (guanxi/horenso/omotenashi). Anadolu/Kayseri ticaret tonu. (`feedback_kayseri_odakli_olsun`)
- **Eksik veri = 0 gösterme YASAK** — eksikse "tahmini/bekliyor" rozeti, mock üret, gerçeği koru. (Mehmet Bey ilkesi)

---

## 🏢 4 Firma + 5 Kullanıcı (erişim matrisi KATİ)

| Kullanıcı | MEBA | MESA | ELMOS | ARKON | Konsolide |
|-----------|:----:|:----:|:-----:|:-----:|:---------:|
| Mehmet Bakırdöğen Bey | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mehmet Maraş Bey      | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fatih Lazoğlu Bey     | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ahmet Esmeray Bey     | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fatih Bey (Konya)     | ❌ | ❌ | ❌ | ✅ | ❌ |

- **Çekirdek Halka** (Maraş + Lazoğlu + Esmeray): 4 firma + Konsolide
- **Dış Halka** (Bakırdöğen + Konya Fatih): sadece kendi firması, konsolide yok
- Tek Logo Go server MESA'da → 4 firma aynı kaynaktan beslenir.

---

## 🗂️ Mevcut Durum (kod tabanından doğrulandı 2026-05-28)

### 13 Sayfa — `src/pages/`
`NabizSayfasi` · `AkisSayfasi` · `AlacaklarSayfasi` · `RaporlarSayfasi` · `VergiAtolyesiSayfasi` · `KonsolideSayfasi` · `AyarlarSayfasi` · `PersonelSayfasi` · `CekSenetSayfasi` · `IsBirligiSayfasi` (V2 rozet) · `ParaHaritasiSayfasi` · `UrunMarjiSayfasi` · `Yarin90GunSayfasi`

### Veri katmanı — `src/data/`
- `firmalar.ts` — 4 firma seed + ortaklık matrisi
- `kullanicilar.ts` — 5 kullanıcı + yetki/izin matrisi
- `gercek-finans.ts` — **gerçek MEBA finans verisi** (mock-finans'tan geçiş yapıldı)
- `meba-real/` — gerçek veri klasörü

### Diğer src
`App.tsx` · `components/` · `hooks/` · `lib/` · `types/` · `main.tsx` · `styles.css`

### Stack (package.json)
TanStack Start + Router · Vite 5 · Tailwind v4 (beta) · Tremor · Framer Motion · GSAP · Visx · TradingView Lightweight Charts · react-countup · three + react-three-fiber/drei · recharts · cmdk · sonner · zod · TypeScript 5.6

---

## 🚀 Çalıştırma

**Tek tık:** repo kökünde `Start-Grup-Finans-Paneli.cmd` (çift tıkla). Otomatik: temizse git pull → gerekirse `npm install --legacy-peer-deps` → `http://127.0.0.1:3000/` (strictPort) → tarayıcı açar.
**Manuel:** `npm run dev` (vite, port 3000).
**Kontroller:** `npm run typecheck` (tsc --noEmit) · `npm run build`. *(Not: ayrı lint script'i yok — eklenebilir.)*

⚠️ Launcher, yerel commit'lenmemiş değişiklik varsa otomatik pull'u **atlar** (dosyaları ezmemek için) — şu an `gercek-finans.ts` değişikliği yüzünden pull atlanacaktır. Normal davranış.

---

## 📌 BEKLEYEN İŞLER

### 🔸 Commit'lenmemiş: `src/data/gercek-finans.ts` (DOKUNMA — Mehmet Bey 2026-05-28)
- **Ne:** İnline `"canli"|"tahmini"|"bekliyor"` union'ı, dışa açık `export type VeriDurum` tipine taşındı.
- **Neden:** Yol haritası **#1 — Veri Güven Endeksi**: her ekran "canlı/tahmini/bekliyor" rozeti gösterecek; bu üçlü vokabüler tek kaynaktan gelmeli.
- **Durum:** Temiz, güvenli refactor (tam yorum disipliniyle). Mehmet Bey "şimdilik dokunma" dedi → olduğu gibi duruyor. Veri Güven Endeksi işine başlandığında devamı getirilir.

### 🔸 V1 → canlı geçiş
- Logo Go bayi entegrasyon görüşmesi → gece çalışan Sync Agent. Brief: `LOGO-GO-BAYI-BRIEF.md`.
- Banka/muhasebeci manuel yükleme akışı (Ayarlar > Veri Kaynağı'nda iskelet var).

---

## 🧾 Son Commit Zinciri (yeni → eski)
- `453cb1f` tek-tık launcher (Start-Grup-Finans-Paneli)
- `604c065` panel gerçek MEBA verisine geçti
- `7017195` AI yorum katmanı yaygınlaştırma + navigasyon genişletme
- `afd2933` 👁️ Süper Yönetici impersonation (5 kullanıcı olarak görüntüle)
- `9787549` 👥 Personel Verimlilik sayfası (12.) — Logo Go bordro
- `7516ea1` 📡 Ayarlar > Veri Kaynağı — Logo Go sync + manuel yükleme
- `3526638` / `0bb7b50` mock-finans TS fix'ler

Deploy: `dist/` + GitHub Pages (memory: sprint commit'i canlıya gitti).

---

## 📚 Repo İçi Dokümanlar
`MASTER-SENTEZ-VIZYON.md` (vizyon + yol haritası) · `LOVABLE-PROMPT.md` + `LOVABLE-BRIEF-PAKETI.md` (Lovable tasarım) · `LOGO-GO-BAYI-BRIEF.md` (entegrasyon) · `BROADCAST-GRAFIK-ARASTIRMA.md` (grafik kalite) · `README.md` *(kısmen eski — 5 sayfa MVP + mock-finans yazıyor; gerçek durum bu HANDOFF'tadır)*

---

## ▶️ Sonraki Adımlar (öneri)
1. **Veri Güven Endeksi #1** — `VeriDurum` refactor'ünü tamamla, her sayfaya canlı/tahmini/bekliyor rozeti.
2. README'yi güncel duruma çek (13 sayfa + gerçek veri modu).
3. `MASTER-SENTEZ-VIZYON.md` yol haritasından #2'yi seç.
