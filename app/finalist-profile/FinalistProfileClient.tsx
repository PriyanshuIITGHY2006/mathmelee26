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

  const initials = me.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className={styles.wrap}>
      <div className={styles.frame} />
      <div className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.brandLogo} src="/logo.jpeg" alt="Mathematics Melee" />
        <span className={styles.brandName}>Mathematics Melee</span>
        <span className={styles.brandSub}>by Polygon · IIT Guwahati</span>
        <span className={styles.brandScript}>The Limit Point</span>
      </div>
      <div className={styles.card}>
        <div className={styles.avatar}>{initials}</div>
        <p className={styles.eyebrow}>Mathematics Melee · Finalist</p>
        <h1 className={styles.name}>{me.name}</h1>
        <p className={styles.college}>{me.college}</p>

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

        <div className={styles.actions}>
          <button onClick={() => router.push("/finalist-setup")} className={styles.editBtn}>Edit Profile</button>
          <button onClick={logout} className={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>
    </main>
  );
}
