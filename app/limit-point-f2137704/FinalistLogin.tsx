"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./limitPoint.module.css";

type Step = "email" | "otp" | "loading";

export default function FinalistLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/finalist-auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error); return; }
      setStep("otp");
    } finally { setBusy(false); }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/finalist-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error); return; }
      router.push(d.hasProfile ? "/finalist-profile" : "/finalist-setup");
    } finally { setBusy(false); }
  }

  return (
    <div className={styles.loginBox}>
      {step === "email" && (
        <form onSubmit={sendOtp} className={styles.loginForm}>
          <input
            type="email"
            required
            placeholder="your.email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.loginInput}
            autoComplete="email"
          />
          <button type="submit" disabled={busy} className={styles.cta}>
            {busy ? "Sending…" : "Enter the Limit Point →"}
          </button>
        </form>
      )}
      {step === "otp" && (
        <form onSubmit={verifyOtp} className={styles.loginForm}>
          <p className={styles.loginHint}>
            OTP sent to <strong>{email}</strong>
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="6-digit code"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
            className={`${styles.loginInput} ${styles.loginInputOtp}`}
            autoComplete="one-time-code"
            autoFocus
          />
          <button type="submit" disabled={busy} className={styles.cta}>
            {busy ? "Verifying…" : "Verify →"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }} className={styles.loginBack}>
            ← Change email
          </button>
        </form>
      )}
      {error && <p className={styles.loginError}>{error}</p>}
    </div>
  );
}
