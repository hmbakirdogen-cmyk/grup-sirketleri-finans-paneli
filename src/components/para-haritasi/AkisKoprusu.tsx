// AkisKoprusu — broadcast-quality akış diyagramı (custom SVG Sankey + GSAP).
//
// Solda gelir kategorileri (yüksekliği oranlı), ortada "Brüt Kâr" sıkışma
// noktası, sağda gider düşümleri ve nihai Net Kâr. Bezier path'leri
// stroke-dashoffset reveal ile sırayla beliriyor (Apple Keynote ritmi).
//
// Hover edilen kategori parlatılır, diğerleri %35 opaklığa düşer (Pigment
// spotlight). Liquid Glass kart, üst sağda CountUp ile özet rakamlar.
//
// Görsel referans: Mosaic Bridge + Pigment Sankey + Bloomberg dark, fakat
// daha sinematik (GSAP timeline). Recharts veya jenerik bar yok.

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import CountUp from "react-countup";
import { ArrowRight, Info } from "lucide-react";
import type { MaliTabloKalemi, ParaHaritasiKategori } from "@/types/domain";

interface Props {
  gelirTablosu: MaliTabloKalemi[];
  paraHaritasi: ParaHaritasiKategori[];
  firmaRenk: string;
}

function formatTL(n: number): string {
  const abs = Math.abs(n);
  const isaret = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(1)}M ₺`;
  if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)}K ₺`;
  return `${isaret}${abs.toFixed(0)} ₺`;
}

// Düzlemsel akış için 5 sütun: Gelir kategorileri → Net Satış → Brüt → Faaliyet → Net Kâr
// Yatay X koordinatları (SVG koordinat sisteminde)
const SUTUN_X = {
  gelir: 60,
  netSatis: 360,
  brut: 620,
  faaliyet: 880,
  netKar: 1140,
} as const;

interface DugumBoyut {
  y: number;
  yukseklik: number;
  tutar: number;
  etiket: string;
  alt?: string;
  renk: string;
  tip: "gelir" | "ara" | "dusus" | "sonuc";
}

export function AkisKoprusu({ gelirTablosu, paraHaritasi, firmaRenk }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  // Gelir kategorilerini al, oranla sırala
  const gelirler = useMemo(
    () => paraHaritasi.filter((k) => k.tip === "gelir").sort((a, b) => b.tutar - a.tutar),
    [paraHaritasi],
  );

  // Gelir tablosu satırları
  const netSatis = gelirTablosu[0]?.tutar ?? 0;
  const smm = Math.abs(gelirTablosu[1]?.tutar ?? 0);
  const brut = gelirTablosu[2]?.tutar ?? 0;
  const fp = Math.abs(gelirTablosu[3]?.tutar ?? 0);
  const faaliyet = gelirTablosu[4]?.tutar ?? 0;
  const finansman = Math.abs(gelirTablosu[5]?.tutar ?? 0);
  const vergi = Math.abs(gelirTablosu[7]?.tutar ?? 0);
  const netKar = gelirTablosu[8]?.tutar ?? 0;

  // Görsel ölçek: en yüksek bar = 380px, diğerleri orantılı
  const olcek = 380 / netSatis;

  // Gelir düğümleri — yatay yığılır, toplam yüksekliği netSatis*olcek olur
  const gelirDugumler: (DugumBoyut & { ad: string; kategori: ParaHaritasiKategori })[] =
    useMemo(() => {
      let yKursoru = 60;
      const arasi = 8; // dikey boşluk
      return gelirler.map((k) => {
        const yk = k.tutar * olcek;
        const dugum = {
          ad: k.ad,
          kategori: k,
          y: yKursoru,
          yukseklik: yk,
          tutar: k.tutar,
          etiket: k.ad,
          alt: formatTL(k.tutar),
          renk: firmaRenk,
          tip: "gelir" as const,
        };
        yKursoru += yk + arasi;
        return dugum;
      });
    }, [gelirler, olcek, firmaRenk]);

  // Toplam gelir yüksekliği (gelirlerin toplam yk + ara boşlukları)
  const gelirToplamYk = gelirDugumler.reduce((s, d) => s + d.yukseklik, 0) +
    (gelirDugumler.length - 1) * 8;
  const gelirBasY = gelirDugumler[0]?.y ?? 60;

  // Net Satış düğümü — boyut netSatis'in toplamı kadar (gelir toplamına eşit)
  const netSatisDugum: DugumBoyut = {
    y: gelirBasY,
    yukseklik: gelirToplamYk,
    tutar: netSatis,
    etiket: "Net Satış",
    alt: formatTL(netSatis),
    renk: "#0ea5e9",
    tip: "ara",
  };

  // Brüt Kâr — SMM düşüldükten sonra
  const brutYk = brut * olcek;
  const brutDugum: DugumBoyut = {
    y: gelirBasY + (smm * olcek) / 2,
    yukseklik: brutYk,
    tutar: brut,
    etiket: "Brüt Kâr",
    alt: formatTL(brut),
    renk: "#06b6d4",
    tip: "ara",
  };
  // SMM düşüm — yukarıdaki kalan kısma çıkar
  const smmDusumY = gelirBasY;
  const smmDusumYk = smm * olcek;

  // Faaliyet Kârı
  const faaliyetYk = faaliyet * olcek;
  const faaliyetDugum: DugumBoyut = {
    y: brutDugum.y + (fp * olcek),
    yukseklik: faaliyetYk,
    tutar: faaliyet,
    etiket: "Faaliyet Kârı",
    alt: formatTL(faaliyet),
    renk: "#22c55e",
    tip: "ara",
  };
  // Faaliyet Giderleri düşüm
  const fpDusumY = brutDugum.y;
  const fpDusumYk = fp * olcek;

  // Net Kâr
  const netKarYk = netKar * olcek;
  const netKarDugum: DugumBoyut = {
    y: faaliyetDugum.y + ((finansman + vergi) * olcek),
    yukseklik: netKarYk,
    tutar: netKar,
    etiket: "Net Kâr",
    alt: formatTL(netKar),
    renk: "#10b981",
    tip: "sonuc",
  };
  const finVergiDusumY = faaliyetDugum.y;
  const finVergiDusumYk = (finansman + vergi) * olcek;

  const SUTUN_GENISLIK = 28;
  const TOTAL_W = 1240;
  const TOTAL_H = 540;

  // GSAP timeline — sayfaya girince akış reveal olur; firma değişince yeniden oynat.
  useEffect(() => {
    if (!svgRef.current) return;
    const scope = svgRef.current;
    const ctx = gsap.context(() => {
      // Bar'lar yukarıdan aşağı clip-reveal
      gsap.from("[data-gsap='dolu-bar']", {
        scaleY: 0,
        transformOrigin: "top",
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
      });
      // Akış path'leri (filled) fade-in
      gsap.from("[data-gsap='akis-path']", {
        opacity: 0,
        duration: 1.0,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.3,
      });
      // Etiketler fade in
      gsap.from("[data-gsap='etiket']", {
        opacity: 0,
        y: 6,
        duration: 0.45,
        stagger: 0.04,
        ease: "power2.out",
        delay: 1.0,
      });
    }, scope);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmaRenk, netKar, gelirDugumler.length]);

  // Bezier path — iki nokta arası yumuşak akış şeridi
  function akisYol(
    x0: number,
    y0Top: number,
    y0Bot: number,
    x1: number,
    y1Top: number,
    y1Bot: number,
  ): string {
    const cx = (x0 + x1) / 2;
    return [
      `M ${x0} ${y0Top}`,
      `C ${cx} ${y0Top}, ${cx} ${y1Top}, ${x1} ${y1Top}`,
      `L ${x1} ${y1Bot}`,
      `C ${cx} ${y1Bot}, ${cx} ${y0Bot}, ${x0} ${y0Bot}`,
      "Z",
    ].join(" ");
  }

  // Net Satış içinde her gelir kategorisinin Y offset'i (sıralı dolu)
  let netSatisOfset = netSatisDugum.y;
  const gelirAkislar = gelirDugumler.map((g) => {
    const akis = {
      key: g.ad,
      gelir: g,
      yol: akisYol(
        SUTUN_X.gelir + SUTUN_GENISLIK,
        g.y,
        g.y + g.yukseklik,
        SUTUN_X.netSatis,
        netSatisOfset,
        netSatisOfset + g.yukseklik,
      ),
    };
    netSatisOfset += g.yukseklik;
    return akis;
  });

  // Net Satış → SMM düşüm + Brüt akış
  const netSatisSmmYol = akisYol(
    SUTUN_X.netSatis + SUTUN_GENISLIK,
    smmDusumY,
    smmDusumY + smmDusumYk,
    SUTUN_X.brut,
    smmDusumY - 30,
    smmDusumY - 30 + smmDusumYk,
  );
  const netSatisBrutYol = akisYol(
    SUTUN_X.netSatis + SUTUN_GENISLIK,
    smmDusumY + smmDusumYk,
    netSatisDugum.y + netSatisDugum.yukseklik,
    SUTUN_X.brut,
    brutDugum.y,
    brutDugum.y + brutDugum.yukseklik,
  );

  // Brüt → Faaliyet (akış) + Faaliyet Gid düşüm
  const brutFpYol = akisYol(
    SUTUN_X.brut + SUTUN_GENISLIK,
    fpDusumY,
    fpDusumY + fpDusumYk,
    SUTUN_X.faaliyet,
    fpDusumY - 30,
    fpDusumY - 30 + fpDusumYk,
  );
  const brutFaaliyetYol = akisYol(
    SUTUN_X.brut + SUTUN_GENISLIK,
    brutDugum.y + fpDusumYk,
    brutDugum.y + brutDugum.yukseklik,
    SUTUN_X.faaliyet,
    faaliyetDugum.y,
    faaliyetDugum.y + faaliyetDugum.yukseklik,
  );

  // Faaliyet → Net Kâr + Finansman/Vergi düşüm
  const faaliyetVergiYol = akisYol(
    SUTUN_X.faaliyet + SUTUN_GENISLIK,
    finVergiDusumY,
    finVergiDusumY + finVergiDusumYk,
    SUTUN_X.netKar,
    finVergiDusumY - 30,
    finVergiDusumY - 30 + finVergiDusumYk,
  );
  const faaliyetNetYol = akisYol(
    SUTUN_X.faaliyet + SUTUN_GENISLIK,
    faaliyetDugum.y + finVergiDusumYk,
    faaliyetDugum.y + faaliyetDugum.yukseklik,
    SUTUN_X.netKar,
    netKarDugum.y,
    netKarDugum.y + netKarDugum.yukseklik,
  );

  function hoverOpak(key: string): number {
    if (!hover) return 1;
    return hover === key ? 1 : 0.18;
  }

  return (
    <div
      ref={(el) => {
        // svgRef sadece SVGSVGElement için; outer div'den GSAP context için
        // gerek yok — useEffect içinde svgRef.current'a (SVG) bağlı.
        void el;
      }}
      className="relative overflow-hidden rounded-3xl border"
      style={{
        background:
          "linear-gradient(180deg, rgba(24,24,27,0.85), rgba(9,9,11,0.85))",
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px) saturate(160%)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Üst başlık */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-500">
            Akış Köprüsü · 12 ay
          </div>
          <div
            className="text-[18px] font-bold mt-1 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Net Satış → Net Kâr
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Ozet etiket="Net Satış" tutar={netSatis} renk="#0ea5e9" />
          <Ozet etiket="Brüt Kâr" tutar={brut} renk="#06b6d4" />
          <Ozet etiket="Net Kâr" tutar={netKar} renk="#10b981" vurgu />
        </div>
      </div>

      {/* SVG akış */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            {/* Gelir akış gradient (firma rengi) */}
            <linearGradient id="grad-gelir" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={firmaRenk} stopOpacity={0.55} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.40} />
            </linearGradient>
            {/* Brüt akış (cyan) */}
            <linearGradient id="grad-brut" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.50} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.40} />
            </linearGradient>
            {/* Faaliyet akış (emerald) */}
            <linearGradient id="grad-faaliyet" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.50} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.40} />
            </linearGradient>
            {/* Düşüm akış (kırmızı) */}
            <linearGradient id="grad-dusum" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.30} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.10} />
            </linearGradient>
            {/* Net Kâr akış */}
            <linearGradient id="grad-net" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.50} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.55} />
            </linearGradient>

            {/* Düşüm bar gradient */}
            <linearGradient id="bar-dusum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
            </linearGradient>
          </defs>

          {/* Akış path'leri (alt katman) */}
          <g>
            {gelirAkislar.map((a) => (
              <path
                key={a.key}
                data-gsap="akis-path"
                d={a.yol}
                fill="url(#grad-gelir)"
                opacity={hoverOpak(a.key)}
                onMouseEnter={() => setHover(a.key)}
                style={{ transition: "opacity 220ms ease" }}
              />
            ))}
            <path data-gsap="akis-path" d={netSatisSmmYol} fill="url(#grad-dusum)" />
            <path data-gsap="akis-path" d={netSatisBrutYol} fill="url(#grad-brut)" />
            <path data-gsap="akis-path" d={brutFpYol} fill="url(#grad-dusum)" />
            <path data-gsap="akis-path" d={brutFaaliyetYol} fill="url(#grad-faaliyet)" />
            <path data-gsap="akis-path" d={faaliyetVergiYol} fill="url(#grad-dusum)" />
            <path data-gsap="akis-path" d={faaliyetNetYol} fill="url(#grad-net)" />
          </g>

          {/* Düğüm barları */}
          {/* Gelir kategorileri */}
          {gelirDugumler.map((g) => (
            <g key={g.ad}>
              <rect
                data-gsap="dolu-bar"
                x={SUTUN_X.gelir}
                y={g.y}
                width={SUTUN_GENISLIK}
                height={g.yukseklik}
                rx={3}
                fill={firmaRenk}
                opacity={hoverOpak(g.ad)}
                onMouseEnter={() => setHover(g.ad)}
                style={{ transition: "opacity 220ms ease", cursor: "pointer" }}
              >
                <title>{`${g.ad} · ${formatTL(g.tutar)}`}</title>
              </rect>
              {/* Sol etiket */}
              <text
                data-gsap="etiket"
                x={SUTUN_X.gelir - 12}
                y={g.y + g.yukseklik / 2 + 4}
                textAnchor="end"
                fill="rgb(228,228,231)"
                fontSize={11}
                fontWeight={600}
                style={{ pointerEvents: "none" }}
              >
                {g.ad}
              </text>
              <text
                data-gsap="etiket"
                x={SUTUN_X.gelir - 12}
                y={g.y + g.yukseklik / 2 + 18}
                textAnchor="end"
                fill="rgb(113,113,122)"
                fontSize={10}
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                style={{ pointerEvents: "none" }}
              >
                {formatTL(g.tutar)}
              </text>
            </g>
          ))}

          {/* Ara düğümler */}
          <DuzumBar dugum={netSatisDugum} x={SUTUN_X.netSatis} g={SUTUN_GENISLIK} />
          <DuzumBar dugum={brutDugum} x={SUTUN_X.brut} g={SUTUN_GENISLIK} />
          <DuzumBar dugum={faaliyetDugum} x={SUTUN_X.faaliyet} g={SUTUN_GENISLIK} />
          {/* Net Kâr düğümü — vurgulu */}
          <g>
            <rect
              data-gsap="dolu-bar"
              x={SUTUN_X.netKar}
              y={netKarDugum.y}
              width={SUTUN_GENISLIK}
              height={netKarDugum.yukseklik}
              rx={3}
              fill={netKarDugum.renk}
              filter="url(#net-glow)"
            />
            <text
              data-gsap="etiket"
              x={SUTUN_X.netKar + SUTUN_GENISLIK + 12}
              y={netKarDugum.y + netKarDugum.yukseklik / 2 + 4}
              fill="rgb(244,244,245)"
              fontSize={12}
              fontWeight={700}
              style={{ pointerEvents: "none" }}
            >
              Net Kâr
            </text>
            <text
              data-gsap="etiket"
              x={SUTUN_X.netKar + SUTUN_GENISLIK + 12}
              y={netKarDugum.y + netKarDugum.yukseklik / 2 + 20}
              fill="rgb(16,185,129)"
              fontSize={12}
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontWeight={700}
              style={{ pointerEvents: "none" }}
            >
              {formatTL(netKar)}
            </text>
          </g>

          {/* Düşüm bar — SMM */}
          <DusumBar
            x={SUTUN_X.brut}
            g={SUTUN_GENISLIK}
            y={smmDusumY - 30}
            yk={smmDusumYk}
            etiket="SMM"
            alt={`-${formatTL(smm)}`}
          />
          {/* Düşüm bar — Faaliyet Gid */}
          <DusumBar
            x={SUTUN_X.faaliyet}
            g={SUTUN_GENISLIK}
            y={fpDusumY - 30}
            yk={fpDusumYk}
            etiket="Faaliyet Gid"
            alt={`-${formatTL(fp)}`}
          />
          {/* Düşüm bar — Finansman + Vergi */}
          <DusumBar
            x={SUTUN_X.netKar}
            g={SUTUN_GENISLIK}
            y={finVergiDusumY - 30}
            yk={finVergiDusumYk}
            etiket="Finansman + Vergi"
            alt={`-${formatTL(finansman + vergi)}`}
          />

          {/* Net Kâr için soft glow */}
          <filter id="net-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </svg>
      </div>

      {/* Alt info bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-zinc-900 text-[11px] text-zinc-500">
        <Info size={12} />
        <span className="flex-1">
          Üzerine gelin: ilgili akış parlatılır. Tıklama (v2'de) Cari Detay'a
          o kategori filtresiyle gider.
        </span>
        <ArrowRight size={12} className="text-zinc-700" />
      </div>
    </div>
  );
}

function aktifKey(g: { ad: string }[], net: number): string {
  return `${g.map((x) => x.ad).join("·")}-${net}`;
}

function Ozet({
  etiket,
  tutar,
  renk,
  vurgu = false,
}: {
  etiket: string;
  tutar: number;
  renk: string;
  vurgu?: boolean;
}) {
  return (
    <div className="text-right">
      <div className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-zinc-500">
        {etiket}
      </div>
      <div
        className="font-bold tabular-nums mt-0.5"
        style={{
          fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
          fontSize: vurgu ? 22 : 17,
          color: renk,
          letterSpacing: "-0.02em",
          textShadow: vurgu ? `0 0 24px ${renk}66` : "none",
        }}
      >
        <CountUp
          end={tutar}
          duration={1.8}
          separator="."
          formattingFn={formatTL}
        />
      </div>
    </div>
  );
}

function DuzumBar({
  dugum,
  x,
  g,
}: {
  dugum: DugumBoyut;
  x: number;
  g: number;
}) {
  return (
    <g>
      <rect
        data-gsap="dolu-bar"
        x={x}
        y={dugum.y}
        width={g}
        height={dugum.yukseklik}
        rx={3}
        fill={dugum.renk}
        opacity={0.85}
      >
        <title>{`${dugum.etiket} · ${dugum.alt ?? ""}`}</title>
      </rect>
      <text
        data-gsap="etiket"
        x={x + g / 2}
        y={dugum.y - 8}
        textAnchor="middle"
        fill="rgb(228,228,231)"
        fontSize={11}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {dugum.etiket}
      </text>
      <text
        data-gsap="etiket"
        x={x + g / 2}
        y={dugum.y + dugum.yukseklik + 16}
        textAnchor="middle"
        fill={dugum.renk}
        fontSize={11}
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontWeight={700}
        style={{ pointerEvents: "none" }}
      >
        {dugum.alt}
      </text>
    </g>
  );
}

function DusumBar({
  x,
  g,
  y,
  yk,
  etiket,
  alt,
}: {
  x: number;
  g: number;
  y: number;
  yk: number;
  etiket: string;
  alt: string;
}) {
  return (
    <g>
      <rect
        data-gsap="dolu-bar"
        x={x}
        y={y}
        width={g}
        height={yk}
        rx={3}
        fill="url(#bar-dusum)"
        stroke="rgba(239,68,68,0.50)"
        strokeWidth={0.5}
        strokeDasharray="2 2"
      >
        <title>{`${etiket} · ${alt}`}</title>
      </rect>
      <text
        data-gsap="etiket"
        x={x + g / 2}
        y={y - 8}
        textAnchor="middle"
        fill="rgb(252,165,165)"
        fontSize={10}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {etiket}
      </text>
      <text
        data-gsap="etiket"
        x={x + g / 2}
        y={y + yk + 14}
        textAnchor="middle"
        fill="rgb(248,113,113)"
        fontSize={10}
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontWeight={700}
        style={{ pointerEvents: "none" }}
      >
        {alt}
      </text>
    </g>
  );
}
