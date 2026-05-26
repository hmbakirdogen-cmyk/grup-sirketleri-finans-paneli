import { useCallback, useEffect, useState } from "react";
import type { FirmaId, Kullanici, KullaniciId } from "@/types/domain";
import { KULLANICILAR, firmayaErisebilir } from "@/data/kullanicilar";

const STORAGE_KULLANICI = "gsfp.aktifKullanici";
const STORAGE_FIRMA = "gsfp.aktifFirma";
const VARSAYILAN_KULLANICI: KullaniciId = "mehmet-maras";

interface AuthDurumu {
  aktifKullanici: Kullanici;
  aktifFirma: FirmaId;
  girisYap: (kullaniciId: KullaniciId) => void;
  firmaSec: (firmaId: FirmaId) => void;
  konsolideErisim: boolean;
  erisilebilirFirmalar: FirmaId[];
}

function ilkFirma(kullanici: Kullanici): FirmaId {
  const ilk = kullanici.firmaIzin[0];
  if (!ilk) throw new Error(`${kullanici.hitap} için firma izni tanımlı değil`);
  return ilk;
}

export function useAuth(): AuthDurumu {
  const [aktifKullaniciId, setAktifKullaniciId] = useState<KullaniciId>(() => {
    if (typeof window === "undefined") return VARSAYILAN_KULLANICI;
    const kayitli = window.localStorage.getItem(STORAGE_KULLANICI) as KullaniciId | null;
    return kayitli && kayitli in KULLANICILAR ? kayitli : VARSAYILAN_KULLANICI;
  });

  const aktifKullanici = KULLANICILAR[aktifKullaniciId];

  const [aktifFirma, setAktifFirma] = useState<FirmaId>(() => {
    if (typeof window === "undefined") return ilkFirma(aktifKullanici);
    const kayitli = window.localStorage.getItem(STORAGE_FIRMA) as FirmaId | null;
    return kayitli && firmayaErisebilir(aktifKullanici, kayitli)
      ? kayitli
      : ilkFirma(aktifKullanici);
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KULLANICI, aktifKullaniciId);
  }, [aktifKullaniciId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_FIRMA, aktifFirma);
  }, [aktifFirma]);

  const girisYap = useCallback((kullaniciId: KullaniciId) => {
    setAktifKullaniciId(kullaniciId);
    setAktifFirma(ilkFirma(KULLANICILAR[kullaniciId]));
  }, []);

  const firmaSec = useCallback(
    (firmaId: FirmaId) => {
      if (!firmayaErisebilir(aktifKullanici, firmaId)) {
        throw new Error(
          `${aktifKullanici.hitap} için ${firmaId.toUpperCase()} erişim yetkisi yok`,
        );
      }
      setAktifFirma(firmaId);
    },
    [aktifKullanici],
  );

  return {
    aktifKullanici,
    aktifFirma,
    girisYap,
    firmaSec,
    konsolideErisim: aktifKullanici.konsolideGorur,
    erisilebilirFirmalar: aktifKullanici.firmaIzin,
  };
}
