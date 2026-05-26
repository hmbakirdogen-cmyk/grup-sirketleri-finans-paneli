// MaliTakvimRozetMini — Lovable standardında üst rozet şeridi.
// "KDV Beyannamesi · 2 gün" gibi gün sayaçları; tıklanınca detay drawer açar (v2).
// Aciliyet: <=3 gün → altın renk; >3 gün → muted.

import { useEffect, useMemo, useState } from "react";
import { yaklasanVadeler, kalanGun, etkinTarih, vadeMeta, type MaliVade } from "@/lib/mali-takvim";
import { TEMA, FONT } from "@/lib/tema";

export function MaliTakvimRozetMini() {
  const [bugun, setBugun] = useState<Date | null>(null);

  useEffect(() => {
    setBugun(new Date());
  }, []);

  const vadeler = useMemo(() => {
    if (!bugun) return [];
    return yaklasanVadeler(bugun, 45).slice(0, 4);
  }, [bugun]);

  if (!bugun || vadeler.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "10px 16px",
        marginBottom: 20,
        background: TEMA.bgKart,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 10,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: TEMA.altin,
          fontWeight: 600,
          fontFamily: FONT.ana,
          marginRight: 4,
        }}
      >
        ⌖ Mali Takvim
      </span>
      {vadeler.map((v) => (
        <VadeRozet key={v.id} vade={v} bugun={bugun} />
      ))}
    </div>
  );
}

function VadeRozet({ vade, bugun }: { vade: MaliVade; bugun: Date }) {
  const kalan = kalanGun(bugun, vade);
  const acil = kalan <= 3;

  // Türk kullanıcısına okunur kısa ad
  const meta = vadeMeta(vade.tip);
  void meta; // ikon/kategori gerekirse kullanılacak

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: FONT.ana,
        fontSize: 12.5,
      }}
      title={`${vade.baslik} · ${new Date(etkinTarih(vade)).toLocaleDateString("tr-TR")}`}
    >
      <span style={{ color: TEMA.inkSoft, fontWeight: 500 }}>
        {kisaltAd(vade.baslik)}
      </span>
      <span
        style={{
          padding: "2px 8px",
          background: acil ? "rgba(212,175,122,0.14)" : "rgba(255,255,255,0.04)",
          color: acil ? TEMA.altin : TEMA.inkMuted,
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 999,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}
      >
        {kalan === 0 ? "bugün" : kalan === 1 ? "yarın" : `${kalan} gün`}
      </span>
    </div>
  );
}

function kisaltAd(baslik: string): string {
  // "Nisan Dönemi MUHSGK Beyannamesi" → "MUHSGK Beyannamesi"
  // "Mayıs Dönemi KDV Beyannamesi" → "KDV Beyannamesi"
  return baslik.replace(/^[A-Za-zğüşıöçĞÜŞİÖÇ]+\s+Dönemi\s+/, "");
}
