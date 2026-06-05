"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./finalistProfile.module.css";

interface Me {
  email: string;
  name: string;
  college: string;
  whatsapp: string | null;
  codeforcesId: string | null;
}

const COMING_SOON = [
  { label: "Schedule", icon: "◷" },
  { label: "Problems", icon: "∑" },
  { label: "Results",  icon: "∎" },
];

export default function FinalistProfileClient() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finalist-auth/me")
      .then(r => {
        if (r.status === 401) { router.replace("/limit-point-f2137704"); return null; }
        return r.json();
      })
      .then(d => { if (d) setMe(d); })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/finalist-auth/logout", { method: "POST" });
    router.push("/limit-point-f2137704");
  }

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!me) return null;

  const initials = me.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={styles.wrap}>

      {/* ── Top nav ───────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navBrand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.navLogo} src="/logo.jpeg" alt="" />
          <div className={styles.navText}>
            <span className={styles.navName}>Mathematics Melee</span>
            <span className={styles.navScript}>The Limit Point</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.navAvatar}>{initials}</div>
          <button onClick={logout} className={styles.navLogout}>Sign out</button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────── */}
      <main className={styles.body}>

        {/* Profile card */}
        <section className={styles.profileCard}>
          <div className={styles.profileTop}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <p className={styles.eyebrow}>Finalist · Mathematics Melee</p>
              <h1 className={styles.name}>{me.name}</h1>
              <p className={styles.college}>{me.college}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <dl className={styles.dl}>
            <dt>Email</dt>
            <dd>{me.email}</dd>
            {me.whatsapp && <><dt>WhatsApp</dt><dd>{me.whatsapp}</dd></>}
            <dt>Codeforces</dt>
            <dd>
              {me.codeforcesId
                ? <a href={`https://codeforces.com/profile/${me.codeforcesId}`} target="_blank" rel="noreferrer" className={styles.cfLink}>{me.codeforcesId} ↗</a>
                : <span className={styles.missing}>Not set — <button onClick={() => router.push("/finalist-setup")} className={styles.setBtn}>add now</button></span>
              }
            </dd>
          </dl>

          <button onClick={() => router.push("/finalist-setup")} className={styles.editBtn}>Edit profile</button>
        </section>

        {/* Coming soon cards */}
        <div className={styles.grid}>
          {COMING_SOON.map(({ label, icon }) => (
            <div key={label} className={styles.soonCard}>
              <span className={styles.soonIcon}>{icon}</span>
              <span className={styles.soonLabel}>{label}</span>
              <span className={styles.soonBadge}>Coming soon</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
