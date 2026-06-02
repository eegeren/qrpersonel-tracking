"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, IdCard, QrCode, RotateCcw, ScanLine, XCircle } from "lucide-react";

const DEVICE_NATIONAL_ID_KEY = "qr-personel-national-id";

function parseQrValue(value: string): { secret: string } {
  const url = new URL(value, window.location.origin);
  const secret = url.searchParams.get("store") ?? value.split("store=").at(-1)?.split("&").at(0) ?? value;

  return { secret };
}

export function QRScanner({ initialQrSecret = "" }: { initialQrSecret?: string }) {
  const ref = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");
  const processingRef = useRef(false);
  const [qrSecret, setQrSecret] = useState(initialQrSecret);
  const [nationalId, setNationalId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"neutral" | "success" | "error">("neutral");
  const [loading, setLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"starting" | "ready" | "failed">("starting");
  const [showManualQr, setShowManualQr] = useState(false);
  const nationalIdIsValid = /^\d{11}$/.test(nationalId);

  const stopScanner = useCallback(() => {
    const scanner = ref.current;
    if (!scanner) return;
    scanner.stop().catch(() => undefined);
  }, []);

  const submitAttendance = useCallback(
    async (secret: string) => {
      if (!nationalIdIsValid || !secret || processingRef.current) return;

      processingRef.current = true;
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
          nationalId,
          qrSecret: secret,
          latitude: position?.coords.latitude,
          longitude: position?.coords.longitude
        })
      });

      const body = await response.json();
      setLoading(false);
      processingRef.current = false;

      if (response.ok) {
        localStorage.setItem(DEVICE_NATIONAL_ID_KEY, nationalId);
        setMessageType("success");
        stopScanner();
      } else {
        setMessageType("error");
        lastScanRef.current = "";
      }

      setMessage(body.message ?? body.error ?? "İşlem tamamlandı.");
    },
    [nationalId, nationalIdIsValid, stopScanner]
  );

  useEffect(() => {
    setNationalId(localStorage.getItem(DEVICE_NATIONAL_ID_KEY) ?? "");
  }, []);

  useEffect(() => {
    if (initialQrSecret && nationalIdIsValid && !processingRef.current && !message) {
      submitAttendance(initialQrSecret);
    }
  }, [initialQrSecret, message, nationalIdIsValid, submitAttendance]);

  useEffect(() => {
    if (!nationalIdIsValid) return;

    const scanner = new Html5Qrcode("qr-reader");
    ref.current = scanner;
    setCameraStatus("starting");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          const { secret } = parseQrValue(decoded);
          if (lastScanRef.current === secret) return;
          lastScanRef.current = secret;
          setQrSecret(secret);
          submitAttendance(secret);
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
  }, [nationalIdIsValid, submitAttendance]);

  function forgetCode() {
    localStorage.removeItem(DEVICE_NATIONAL_ID_KEY);
    setNationalId("");
    setQrSecret("");
    lastScanRef.current = "";
    processingRef.current = false;
    setMessageType("neutral");
    setMessage("T.C. kimlik numarası bu cihazdan kaldırıldı.");
  }

  function updateManualQr(value: string) {
    const { secret } = parseQrValue(value.trim());
    setQrSecret(secret);
    if (secret) submitAttendance(secret);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-soft">
        <div className="relative min-h-[330px]">
          {nationalIdIsValid ? (
            <div id="qr-reader" className="min-h-[330px] bg-ink text-white" />
          ) : (
            <div className="grid min-h-[330px] place-items-center px-8 text-center text-white">
              <div>
                <IdCard className="mx-auto mb-3" size={36} aria-hidden />
                <p className="text-lg font-semibold">Önce T.C. kimlik girin</p>
                <p className="mt-2 text-sm text-white/65">11 hane tamamlanınca kamera açılır.</p>
              </div>
            </div>
          )}
          {nationalIdIsValid && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-ink shadow-soft">
                <ScanLine size={16} aria-hidden />
                {loading ? "İşleniyor" : cameraStatus === "ready" ? "QR okutun" : cameraStatus === "failed" ? "Manuel giriş" : "Kamera açılıyor"}
              </span>
            </div>
          )}
          {message && (
            <div className="absolute inset-0 grid place-items-center bg-ink/70 px-6 backdrop-blur-sm">
              <div
                className={[
                  "w-full rounded-lg bg-white p-6 text-center shadow-soft",
                  messageType === "success" ? "border border-mint/25" : messageType === "error" ? "border border-coral/25" : "border border-ink/10"
                ].join(" ")}
              >
                {messageType === "success" ? (
                  <CheckCircle2 className="mx-auto text-mint" size={56} aria-hidden />
                ) : messageType === "error" ? (
                  <XCircle className="mx-auto text-coral" size={56} aria-hidden />
                ) : (
                  <IdCard className="mx-auto text-ink/50" size={56} aria-hidden />
                )}
                <p className={["mt-4 text-xl font-semibold", messageType === "success" ? "text-mint" : messageType === "error" ? "text-coral" : "text-ink"].join(" ")}>
                  {message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-cloud p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <IdCard size={14} aria-hidden />
              Personel
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{nationalId ? `${nationalId.slice(0, 3)}******${nationalId.slice(-2)}` : "Kimlik yok"}</p>
          </div>
          <div className="rounded-lg bg-cloud p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <QrCode size={14} aria-hidden />
              QR
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{qrSecret ? "Okundu" : "Bekliyor"}</p>
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink/65">T.C. kimlik numarası</span>
          <input
            value={nationalId}
            onChange={(event) => setNationalId(event.target.value.replace(/\D/g, "").slice(0, 11))}
            inputMode="numeric"
            maxLength={11}
            placeholder="11 haneli T.C. kimlik"
            className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3"
          />
        </label>
        {showManualQr && (
          <label className="block">
            <span className="text-sm font-medium text-ink/65">QR bağlantısı veya anahtarı</span>
            <input
              value={qrSecret}
              onChange={(event) => updateManualQr(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3"
            />
          </label>
        )}
        <button onClick={forgetCode} type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink/10 text-sm font-semibold text-ink/65">
          <RotateCcw size={16} aria-hidden />
          Bu cihazdaki kimliği değiştir
        </button>
      </div>
    </div>
  );
}
