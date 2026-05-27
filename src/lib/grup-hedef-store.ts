// Grup Hedef Store — 4 firma için yıllık hedef + grup toplam, localStorage tabanlı
// MEBA Komuta Merkezi'nin hedef-override-store.ts şablonundan adapte edildi.
//
// MVP: localStorage. Production: Supabase UPSERT (firma_id + yil + tutar + kim_guncelledi).
//
// Kullanım:
//   const { hedefler, setFirmaHedef, sifirla } = useGrupHedef();
//   setFirmaHedef("meba", 30_000_000, aktifKullaniciId);

import { useEffect, useState, useCallback } from "react";
import { MEVCUT_FIRMALAR, PANEL_HEDEFLERI } from "@/data/gercek-finans";
import type { FirmaId } from "@/types/domain";

const STORAGE_KEY = "gsfp.grup-hedef.v1";

interface GrupHedef {
  /** Her firma için yıllık hedef (TL) */
  firma: Partial<Record<FirmaId, number>>;
  /** Son güncelleyen ve zamanı (audit değil, sadece bilgi) */
  sonGuncelleyen?: string;
  sonGuncelleme?: string;
}

const VARSAYILAN: Record<FirmaId, number> = {
  meba: PANEL_HEDEFLERI.meba ?? 32_000_000,
  mesa: 0,
  elmos: 0,
  arkon: 0,
};

export function okuHedef(): GrupHedef {
  if (typeof window === "undefined") return { firma: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { firma: {} };
    return JSON.parse(raw) as GrupHedef;
  } catch {
    return { firma: {} };
  }
}

function yazHedef(h: GrupHedef): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
    window.dispatchEvent(new Event("grup-hedef-change"));
  } catch {
    /* sessiz */
  }
}

export function hedefDeger(firmaId: FirmaId): number {
  const h = okuHedef();
  return h.firma[firmaId] ?? VARSAYILAN[firmaId];
}

export function useGrupHedef() {
  const [hedef, setHedef] = useState<GrupHedef>(() => okuHedef());

  useEffect(() => {
    const onChange = () => setHedef(okuHedef());
    window.addEventListener("grup-hedef-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("grup-hedef-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setFirmaHedef = useCallback((firmaId: FirmaId, tutar: number, kim?: string) => {
    const mevcut = okuHedef();
    const yeni: GrupHedef = {
      firma: { ...mevcut.firma, [firmaId]: Math.max(0, Math.round(tutar)) },
      sonGuncelleyen: kim ?? mevcut.sonGuncelleyen,
      sonGuncelleme: new Date().toISOString(),
    };
    yazHedef(yeni);
    setHedef(yeni);
  }, []);

  const sifirla = useCallback(() => {
    yazHedef({ firma: {} });
    setHedef({ firma: {} });
  }, []);

  const firmaHedefi = useCallback(
    (firmaId: FirmaId): number => hedef.firma[firmaId] ?? VARSAYILAN[firmaId],
    [hedef],
  );

  const grupToplam = useCallback((): number => {
    return MEVCUT_FIRMALAR.reduce(
      (s, f) => s + firmaHedefi(f),
      0,
    );
  }, [firmaHedefi]);

  return {
    hedef,
    firmaHedefi,
    grupToplam,
    setFirmaHedef,
    sifirla,
    varsayilan: VARSAYILAN,
  };
}
