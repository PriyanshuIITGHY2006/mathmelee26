"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./finalistSetup.module.css";

interface Me {
  email: string;
  name: string;
  college: string;
  whatsapp: string | null;
  codeforcesId: string | null;
}

export default function FinalistSetup() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [cf, setCf] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finalist-auth/me")
      .then(r => {
        if (r.status === 401) { router.replace("/limit-point-f2137704"); return null; }
        return r.json();
      })
      .then(d => { if (d) { setMe(d); setCf(d.codeforcesId ?? ""); } })
      .finally(() => setLoading(false));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/finalist-auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeforcesId: cf }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error); return; }
      router.push("/finalist-profile");
    } finally { setBusy(false); }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!me) return null;

  return (
    <main className={styles.wrap}>
      <div className={styles.frame} />
      <div className={styles.card}>
        <p className={styles.eyebrow}>Finalist Portal</p>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.sub}>One last step before you enter.</p>

        <form onSubmit={save} className={styles.form}>
          <Field label="Name" value={me.name} readOnly />
          <Field label="Email" value={me.email} readOnly />
          <Field label="College / Institution" value={me.college} readOnly />
          {me.whatsapp && <Field label="WhatsApp" value={me.whatsapp} readOnly />}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Codeforces Handle</label>
            <input
              type="text"
              required
              placeholder="e.g. tourist"
              value={cf}
              onChange={e => setCf(e.target.value.trim())}
              className={styles.input}
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={busy || !cf} className={styles.btn}>
            {busy ? "Saving…" : "Enter the Portal →"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      <input type="text" value={value} readOnly={readOnly} className={`${styles.input} ${readOnly ? styles.inputReadOnly : ""}`} />
    </div>
  );
}
