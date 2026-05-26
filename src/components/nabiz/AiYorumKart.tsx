// AiYorumKart — Nabız sayfası AI yorum
// Anadolu iş dili: "el sıkışmak", "söz", "mutabakat", "hatır", "denge", "bereket"
// 3-4 cümle, vurguda renkli rozet (yeşil iyileşme / amber dikkat / kırmızı uyarı)
//
// MVP: mock metin (firma + sayıdan üretilir)
// V2: Claude Opus 4.7 server function ile gerçek AI üretim

import { Sparkles, MessageSquare } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { FIRMALAR } from "@/data/firmalar";
import type { FirmaId, AylikKpi } from "@/types/domain";
import { useAuth } from "@/hooks/useAuth";

interface AiYorumKartProps {
  firmaId: FirmaId;
  son12Ay: AylikKpi[];
}

type Ton = "iyi" | "dikkat" | "uyari";

interface YorumCumlesi {
  metin: string;
  ton: Ton;
}

function tonRenk(ton: Ton): string {
  return ton === "iyi"
    ? "rgb(34,197,94)"
    : ton === "dikkat"
      ? "rgb(245,158,11)"
      : "rgb(239,68,68)";
}

function uretYorum(firmaId: FirmaId, son12Ay: AylikKpi[], hitap: string): YorumCumlesi[] {
  const firma = FIRMALAR[firmaId];
  const son = son12Ay[son12Ay.length - 1]!;
  const onceki = son12Ay[son12Ay.length - 2]!;
  const yilOnce = son12Ay[0]!;

  const ciroDelta = ((son.ciro - onceki.ciro) / onceki.ciro) * 100;
  const ciroYilDelta = ((son.ciro - yilOnce.ciro) / yilOnce.ciro) * 100;
  const marjDelta = son.brutMarj - onceki.brutMarj;
  const alacakDelta = ((son.alacak - onceki.alacak) / onceki.alacak) * 100;

  const cumleler: YorumCumlesi[] = [];

  // 1. Genel durum (giriş cümlesi)
  if (ciroDelta > 3) {
    cumleler.push({
      ton: "iyi",
      metin: `${hitap}, ${firma.kisaAd}'nin bu ay cirosu geçen aya göre %${ciroDelta.toFixed(1)} arttı — geçen yılın aynı dönemine göre ise %${ciroYilDelta.toFixed(0)} yukarıdayız. İlişkiler güçlü, denge yerinde.`,
    });
  } else if (ciroDelta < -3) {
    cumleler.push({
      ton: "uyari",
      metin: `${hitap}, bu ay ciroda %${Math.abs(ciroDelta).toFixed(1)} bir düşüş var — geçen aya göre. Sebebini birlikte bakalım, hangi cariden kayıp olduğunu Cari Detay'da görebiliriz.`,
    });
  } else {
    cumleler.push({
      ton: "dikkat",
      metin: `${hitap}, ${firma.kisaAd} bu ay yatay seyrediyor (geçen aya göre %${ciroDelta.toFixed(1)}). Yıl ortalamasında %${ciroYilDelta.toFixed(0)} büyüme var, bereket sürüyor.`,
    });
  }

  // 2. Marj durumu
  if (marjDelta < -1.5) {
    cumleler.push({
      ton: "uyari",
      metin: `Brüt marj geçen aya göre ${Math.abs(marjDelta).toFixed(1)} puan eridi (%${son.brutMarj.toFixed(1)}). Maliyet baskısı görünüyor — tedarikçilerle bir mutabakat zamanı gelmiş olabilir.`,
    });
  } else if (marjDelta > 1) {
    cumleler.push({
      ton: "iyi",
      metin: `Marj iyileşiyor — geçen aya göre +${marjDelta.toFixed(1)} puan (%${son.brutMarj.toFixed(1)}). Yapılan pazarlık karşılığını veriyor.`,
    });
  }

  // 3. Alacak / cari sıkışıklığı
  if (alacakDelta > 8) {
    cumleler.push({
      ton: "dikkat",
      metin: `Açık alacaklar %${alacakDelta.toFixed(0)} yukarı çıktı (${(son.alacak / 1_000_000).toFixed(1)}M ₺). Vade defteri sıkışmaya başlamış — hatırlatma yapmanız gereken birkaç büyük cari var.`,
    });
  }

  return cumleler;
}

export function AiYorumKart({ firmaId, son12Ay }: AiYorumKartProps) {
  const { aktifKullanici } = useAuth();
  const cumleler = uretYorum(firmaId, son12Ay, aktifKullanici.hitap);

  return (
    <GlassCard hero parallax className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            color: "white",
          }}
        >
          <Sparkles size={14} />
        </span>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
            AI Yorum
          </div>
          <div className="text-[10px] text-zinc-600">Anadolu iş dili · son aya bakış</div>
        </div>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          aria-label="Sohbet et"
          title="AI ile sohbet et (Cmd+K)"
        >
          <MessageSquare size={13} />
        </button>
      </div>

      <div className="space-y-2.5">
        {cumleler.map((c, i) => (
          <div
            key={i}
            className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-300"
          >
            <span
              className="block w-0.5 rounded-full shrink-0 my-0.5"
              style={{ background: tonRenk(c.ton) }}
            />
            <p className="flex-1">{c.metin}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Mock yorum · v2'de Claude Opus 4.7 ile canlı üretim</span>
        <span className="font-mono">
          {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
        </span>
      </div>
    </GlassCard>
  );
}
