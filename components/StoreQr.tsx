"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink } from "lucide-react";

export function StoreQr({ value, fileName = "magaza-qr", title }: { value: string; fileName?: string; title?: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(value, { margin: 2, width: 220 }).then(setSrc);
  }, [value]);

  if (!src) return <div className="h-[220px] w-[220px] animate-pulse rounded-lg bg-ink/5" />;

  function downloadQr() {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${fileName}.png`;
    link.click();
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {title && <p className="text-sm font-semibold text-ink">{title}</p>}
      <img src={src} alt="Mağaza QR kodu" className="h-[220px] w-[220px] rounded-lg border border-ink/10 bg-white p-3" />
      <div className="grid w-full grid-cols-2 gap-2">
        <button onClick={downloadQr} type="button" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white">
          <Download size={16} aria-hidden />
          İndir
        </button>
        <a href={value} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/10 text-sm font-semibold text-ink/70">
          <ExternalLink size={16} aria-hidden />
          Aç
        </a>
      </div>
    </div>
  );
}
