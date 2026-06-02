"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, KeyRound, QrCode, RotateCcw, ScanLine } from "lucide-react";

const DEVICE_EMPLOYEE_CODE_KEY = "qr-personel-code";

type AttendanceAction = "checkin" | "checkout";

export function QRScanner({ initialQrSecret = "", initialAction = "checkin" }: { initialQrSecret?: string; initialAction?: AttendanceAction }) {
  const ref = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");
  const [qrSecret, setQrSecret] = useState(initialQrSecret);
  const [action, setAction] = useState<AttendanceAction>(initialAction);
  const [employeeCode, setEmployeeCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"neutral" | "success" | "error">("neutral");
  const [loading, setLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"starting" | "ready" | "failed">("starting");
  const [showManualQr, setShowManualQr] = useState(Boolean(initialQrSecret));

  useEffect(() => {
    setEmployeeCode(localStorage.getItem(DEVICE_EMPLOYEE_CODE_KEY) ?? "");
  }, []);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    ref.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          const url = new URL(decoded, window.location.origin);
          const secret = url.searchParams.get("store") ?? decoded.split("store=").at(-1)?.split("&").at(0) ?? decoded;
          const nextAction = url.searchParams.get("action") === "checkout" ? "checkout" : "checkin";
          const scanKey = `${secret}:${nextAction}`;
          if (lastScanRef.current === scanKey) return;
          lastScanRef.current = scanKey;
          setQrSecret(secret);
          setAction(nextAction);
          setMessageType("success");
          setMessage(nextAction === "checkout" ? "Çıkış QR okundu. Kaydetmek için butona basın." : "Giriş QR okundu. Kaydetmek için butona basın.");
        },
        () => undefined
      )
      .then(() => setCameraStatus("ready"))
      .catch(() => {
        setCameraStatus("failed");
        setShowManualQr(true);
        setMessageType("error");
        setMessage("Kamera başlatılamadı. QR kodu elle girebilirsiniz.");
      });

    return () => {
      scanner.stop().catch(() => undefined);
    };
  }, []);

  async function submit() {
    if (!employeeCode || !qrSecret) return;
    setLoading(true);
    setMessage("");
    setMessageType("neutral");

    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
    });

    const response = await fetch("/api/attendance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode,
        qrSecret,
        action,
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude
      })
    });

    const body = await response.json();
    setLoading(false);
    if (response.ok) {
      localStorage.setItem(DEVICE_EMPLOYEE_CODE_KEY, employeeCode);
      setMessageType("success");
    } else {
      setMessageType("error");
    }
    setMessage(body.message ?? body.error ?? "İşlem tamamlandı.");
  }

  function forgetCode() {
    localStorage.removeItem(DEVICE_EMPLOYEE_CODE_KEY);
    setEmployeeCode("");
    setMessageType("neutral");
    setMessage("Personel kodu bu cihazdan kaldırıldı.");
  }

  const buttonText = loading
    ? "Kaydediliyor..."
    : !employeeCode
      ? "Personel kodunu girin"
      : !qrSecret
        ? "QR okutun"
        : action === "checkout"
          ? "Çıkış kaydet"
          : "Giriş kaydet";

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-soft">
        <div className="relative">
          <div id="qr-reader" className="min-h-[330px] bg-ink text-white" />
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-ink shadow-soft">
              <ScanLine size={16} aria-hidden />
              {cameraStatus === "ready" ? "Kamera hazır" : cameraStatus === "failed" ? "Manuel giriş" : "Kamera açılıyor"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-cloud p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <KeyRound size={14} aria-hidden />
              Personel
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{employeeCode || "Kod yok"}</p>
          </div>
          <div className="rounded-lg bg-cloud p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <QrCode size={14} aria-hidden />
              QR
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{qrSecret ? (action === "checkout" ? "Çıkış" : "Giriş") : "Bekliyor"}</p>
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink/65">Personel kodu</span>
          <input
            value={employeeCode}
            onChange={(event) => setEmployeeCode(event.target.value.trim())}
            inputMode="numeric"
            placeholder="Örn. 482913"
            className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3"
          />
        </label>
        {showManualQr && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-ink/65">QR anahtarı</span>
              <input value={qrSecret} onChange={(event) => setQrSecret(event.target.value.trim())} className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setAction("checkin")} type="button" className={`h-10 rounded-lg text-sm font-semibold ${action === "checkin" ? "bg-mint text-white" : "bg-cloud text-ink/65"}`}>
                Giriş
              </button>
              <button onClick={() => setAction("checkout")} type="button" className={`h-10 rounded-lg text-sm font-semibold ${action === "checkout" ? "bg-coral text-white" : "bg-cloud text-ink/65"}`}>
                Çıkış
              </button>
            </div>
          </div>
        )}
        <button onClick={submit} disabled={loading || !employeeCode || !qrSecret} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint font-semibold text-white disabled:opacity-60">
          {loading ? <Camera size={18} aria-hidden /> : <CheckCircle2 size={18} aria-hidden />}
          {buttonText}
        </button>
        <button onClick={() => setShowManualQr((value) => !value)} type="button" className="h-10 w-full rounded-lg bg-cloud text-sm font-semibold text-ink/65">
          {showManualQr ? "QR anahtarını gizle" : "QR anahtarını elle gir"}
        </button>
        <button onClick={forgetCode} type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink/10 text-sm font-semibold text-ink/65">
          <RotateCcw size={16} aria-hidden />
          Bu cihazdaki kodu değiştir
        </button>
        {message && (
          <p
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium",
              messageType === "success" ? "bg-mint/10 text-mint" : messageType === "error" ? "bg-coral/10 text-coral" : "bg-cloud text-ink/75"
            ].join(" ")}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
