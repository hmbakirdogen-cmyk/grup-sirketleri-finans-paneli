# Grup Şirketleri Finans Paneli — repo rehberi (CLAUDE.md)

> Detaylı durum: [HANDOFF.md](HANDOFF.md). Tüm projeler haritası: `..\PROJELER-HARITASI.md`.

## Kimlik
- **Proje:** 4 firma grubunun (MESA + MEBA + ELMOS + ARKON) yönetici finans paneli.
- **Yerel klasör:** `grup-finans-paneli` (eski: `grup-sirketleri-finans-paneli`; hedef `C:\Users\Admin\Projeler\grup-finans-paneli`).
- **GitHub:** `hmbakirdogen-cmyk/grup-finans-paneli` (rename bekliyor)
- **Deploy:** GitHub Pages · **Durum:** 🟢 aktif geliştirme

## Bu repo NEDİR / NE DEĞİLDİR
- ✅ MEBA Komuta Merkezi'nden **AYRI** bir program (KATİ). 4 firma grubu için.
- ❌ MEBA Komuta portalı değil · ❌ Teklif Sistemi değil. **"Lens" adı YASAK.**

## Stack
TanStack Start + Vite + Tailwind v4 + Tremor + Framer Motion + GSAP + Visx + Lightweight Charts + react-countup. Çalıştır: `Start-Grup-Finans-Paneli.cmd` (port 3000) veya `npm run dev`.

## KATİ kurallar (memory ile birebir)
- **Editorial Press dili:** Playfair Display + DM Sans + krem zemin + serif rakam. Dark/neon/jenerik 3D YASAK. Monocle/WSJ Weekend prestiji.
- **3D grafik stili her yerde** (Chart3DBackdrop+glow+gradient); sayı kısaltma YASAK (tam Türkçe `30.605.000 ₺`).
- **MESA #dc2626** · MEBA cyan · ELMOS yeşil · ARKON amber (aktif firma → `--accent`).
- **V1 muhasebe sınırı:** yalnızca Logo Go + manuel yükleme; İş Birliği/AI sohbet → V2 rozet.
- **Ortak güveni:** audit/log/denetim sayfası YASAK. Hitabet "[Soyad] Bey". Yabancı kültür terimi yasak.
- **Eksik veri = 0 gösterme YASAK** → "canlı/tahmini/bekliyor" rozeti (Veri Güven Endeksi #1 yarım: `gercek-finans.ts` — DOKUNMA, Mehmet Bey kararı).
