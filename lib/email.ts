import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY ?? "" });

// ─── Shared header / footer HTML ─────────────────────────────────────────────

const emailHeader = `
<tr><td style="background:#0f172a;border-radius:14px 14px 0 0;padding:0">

  <!-- Math symbols row -->
  <div style="padding:20px 32px 0;text-align:center;letter-spacing:0.3em;font-size:13px;color:#1e293b;font-family:Georgia,serif;user-select:none">
    &pi;&nbsp;&nbsp;&sum;&nbsp;&nbsp;&infin;&nbsp;&nbsp;&radic;&nbsp;&nbsp;&int;&nbsp;&nbsp;&Delta;&nbsp;&nbsp;&theta;&nbsp;&nbsp;&part;&nbsp;&nbsp;&ge;
  </div>

  <!-- Brand -->
  <div style="padding:16px 32px 24px;text-align:center">
    <p style="margin:0 0 3px 0;font-family:Georgia,serif;font-size:22px;font-weight:400;letter-spacing:0.18em;color:#f1f5f9;text-transform:uppercase">
      Mathematics Melee
    </p>
    <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:13px;letter-spacing:0.25em;color:#ef4444;text-transform:uppercase">
      &lsquo;26
    </p>
    <p style="margin:0;font-family:sans-serif;font-size:10px;color:#475569;letter-spacing:0.2em;text-transform:uppercase">
      Polygon &nbsp;&middot;&nbsp; IIT Guwahati
    </p>
  </div>

  <!-- Bottom symbols row -->
  <div style="padding:0 32px 18px;text-align:center;letter-spacing:0.3em;font-size:11px;color:#1e293b;font-family:Georgia,serif">
    &mdash;&nbsp;&nbsp;&pi;&nbsp;&nbsp;&sum;&nbsp;&nbsp;&infin;&nbsp;&nbsp;&radic;&nbsp;&nbsp;&int;&nbsp;&nbsp;&mdash;
  </div>
</td></tr>
`;

const emailFooter = `
<tr><td style="background:#0f172a;border-radius:0 0 14px 14px;padding:28px 32px;text-align:center">
  <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:12px;color:#64748b;font-style:italic;line-height:1.7">
    &ldquo;Mathematics Melee rewards one thing above all: the right answer.&rdquo;
  </p>
  <div style="width:40px;height:1px;background:#1e293b;margin:12px auto"></div>
  <p style="margin:8px 0 0 0;font-family:sans-serif;font-size:10px;color:#334155;letter-spacing:0.15em;text-transform:uppercase">
    Polygon &nbsp;&middot;&nbsp; Mathematical Society of IIT Guwahati &nbsp;&middot;&nbsp; Summer 2026
  </p>
</td></tr>
`;

// ─── Confirmation email ───────────────────────────────────────────────────────

interface ConfirmationEmailParams {
  to: string;
  name: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  interviewer: string | null;
  bookingId: string;
  meetingLink: string | null;
}

export async function sendConfirmationEmail(params: ConfirmationEmailParams) {
  const { to, name, date, day, startTime, endTime, interviewer, bookingId, meetingLink } = params;
  const shortId = bookingId.slice(0, 12).toUpperCase();

  const interviewerRow = interviewer ? `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:11px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:38%">Interviewer</td>
      <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-family:Georgia,serif">${interviewer}</td>
    </tr>` : "";

  const meetRow = meetingLink ? `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:11px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:38%">Meet Link</td>
      <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-family:monospace">
        <a href="${meetingLink}" style="color:#2563eb;text-decoration:none">${meetingLink.replace("https://","")}</a>
      </td>
    </tr>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Booking Confirmed — Mathematics Melee '26</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;min-height:100vh">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

    ${emailHeader}

    <!-- Body -->
    <tr><td style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;padding:40px 36px">

      <!-- Status icon -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:56px;height:56px;background:#f0fdf4;border:2px solid #86efac;border-radius:50%;text-align:center;line-height:54px;font-size:26px;color:#16a34a">
          &#10003;
        </div>
      </div>

      <!-- Heading -->
      <h1 style="margin:0 0 8px 0;text-align:center;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0f172a;letter-spacing:0.02em">
        Booking Confirmed
      </h1>
      <p style="margin:0 0 6px 0;text-align:center;font-family:Georgia,serif;font-size:14px;color:#64748b;font-style:italic">
        Supremum Round &mdash; Mathematics Melee &lsquo;26
      </p>
      <p style="margin:0 0 32px 0;text-align:center;font-family:sans-serif;font-size:13px;color:#94a3b8">
        Hi ${name}, your session is reserved.
      </p>

      <!-- Divider with symbol -->
      <div style="text-align:center;margin-bottom:28px">
        <div style="display:inline-block;border-top:1px solid #e2e8f0;width:80px;vertical-align:middle"></div>
        <span style="display:inline-block;padding:0 12px;color:#cbd5e1;font-family:Georgia,serif;font-size:16px;vertical-align:middle">&Sigma;</span>
        <div style="display:inline-block;border-top:1px solid #e2e8f0;width:80px;vertical-align:middle"></div>
      </div>

      <!-- Details table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9">
        <tr>
          <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:11px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:38%">Date</td>
          <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-family:Georgia,serif">${day}, ${date}</td>
        </tr>
        <tr>
          <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:11px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase">Time</td>
          <td style="padding:13px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-family:Georgia,serif">${startTime} &ndash; ${endTime}</td>
        </tr>
        ${interviewerRow}
        ${meetRow}
        <tr>
          <td style="padding:13px 0;color:#94a3b8;font-size:11px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase">Booking ID</td>
          <td style="padding:13px 0;font-size:13px;color:#0f172a;font-family:monospace;letter-spacing:0.05em">${shortId}</td>
        </tr>
      </table>

      <!-- Important box -->
      <div style="margin-top:28px;border-left:3px solid #f59e0b;background:#fffbeb;padding:16px 18px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 4px 0;font-family:sans-serif;font-size:11px;font-weight:700;color:#b45309;letter-spacing:0.1em;text-transform:uppercase">Important</p>
        <p style="margin:0;font-family:sans-serif;font-size:12px;color:#92400e;line-height:1.7">
          You must join using <strong>two separate physical devices</strong> (laptop + phone). Camera and microphone must be on at all times. Keep this time slot free — no rescheduling except by organiser decision.
        </p>
      </div>

      <!-- Contact note -->
      <p style="margin:24px 0 0 0;text-align:center;font-family:sans-serif;font-size:11px;color:#cbd5e1;line-height:1.6">
        Made a mistake in your registration?<br>
        Contact the organisers to cancel and re-register.
      </p>

    </td></tr>

    ${emailFooter}

  </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    await client.transactionalEmails.sendTransacEmail({
      to: [{ email: to, name }],
      sender: {
        email: process.env.BREVO_FROM_EMAIL ?? "noreply@mathsmelee.app",
        name: process.env.BREVO_FROM_NAME ?? "Mathematics Melee '26",
      },
      subject: `Booking Confirmed — Mathematics Melee ’26 · ${day}, ${date}`,
      htmlContent: html,
    });
  } catch (err) {
    console.error("[email] Failed to send confirmation:", err);
  }
}

// ─── Meet link email ──────────────────────────────────────────────────────────

interface MeetLinkEmailParams {
  to: string;
  name: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
}

export async function sendMeetLinkEmail(params: MeetLinkEmailParams) {
  const { to, name, date, day, startTime, endTime, meetingLink } = params;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Meet Link — Mathematics Melee '26</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;min-height:100vh">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

    ${emailHeader}

    <!-- Body -->
    <tr><td style="background:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;padding:40px 36px">

      <!-- Status icon -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:56px;height:56px;background:#eff6ff;border:2px solid #93c5fd;border-radius:50%;text-align:center;line-height:54px;font-size:22px;color:#2563eb;font-family:sans-serif;font-weight:700">
          &#9654;
        </div>
      </div>

      <!-- Heading -->
      <h1 style="margin:0 0 8px 0;text-align:center;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0f172a;letter-spacing:0.02em">
        Your Meet Link is Ready
      </h1>
      <p style="margin:0 0 32px 0;text-align:center;font-family:sans-serif;font-size:13px;color:#94a3b8">
        Hi ${name}, your Supremum Round session starts soon.
      </p>

      <!-- Meet link button block -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px 24px;text-align:center;margin-bottom:28px">
        <p style="margin:0 0 6px 0;font-family:sans-serif;font-size:10px;color:#94a3b8;letter-spacing:0.2em;text-transform:uppercase">Join your session</p>
        <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:14px;color:#475569">${day}, ${date} &nbsp;&middot;&nbsp; ${startTime} &ndash; ${endTime}</p>
        <a href="${meetingLink}"
           style="display:inline-block;background:#0f172a;color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase">
          Join Google Meet &rarr;
        </a>
        <p style="margin:16px 0 0 0;font-family:monospace;font-size:11px;color:#94a3b8">
          ${meetingLink.replace("https://", "")}
        </p>
      </div>

      <!-- Divider with symbol -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;border-top:1px solid #e2e8f0;width:80px;vertical-align:middle"></div>
        <span style="display:inline-block;padding:0 12px;color:#cbd5e1;font-family:Georgia,serif;font-size:16px;vertical-align:middle">&pi;</span>
        <div style="display:inline-block;border-top:1px solid #e2e8f0;width:80px;vertical-align:middle"></div>
      </div>

      <!-- Reminder box -->
      <div style="border-left:3px solid #f59e0b;background:#fffbeb;padding:16px 18px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 4px 0;font-family:sans-serif;font-size:11px;font-weight:700;color:#b45309;letter-spacing:0.1em;text-transform:uppercase">Reminder</p>
        <p style="margin:0;font-family:sans-serif;font-size:12px;color:#92400e;line-height:1.7">
          Join with <strong>two separate physical devices</strong>. Camera and microphone on at all times. Only the final answer is required &mdash; state it clearly to the Judge.
        </p>
      </div>

      <p style="margin:24px 0 0 0;text-align:center;font-family:sans-serif;font-size:11px;color:#cbd5e1">
        This link is for your assigned session only. Do not share it.
      </p>

    </td></tr>

    ${emailFooter}

  </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    await client.transactionalEmails.sendTransacEmail({
      to: [{ email: to, name }],
      sender: {
        email: process.env.BREVO_FROM_EMAIL ?? "noreply@mathsmelee.app",
        name: process.env.BREVO_FROM_NAME ?? "Mathematics Melee ‘26",
      },
      subject: `Your Meet Link — Mathematics Melee ‘26 · ${day}, ${date} ${startTime}`,
      htmlContent: html,
    });
  } catch (err) {
    console.error("[email] Failed to send meet link:", err);
  }
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your OTP — Mathematics Melee</title></head>
<body style="margin:0;padding:0;background:#f4f1ea">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:40px 16px">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
    <tr><td style="background:#1b1a17;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center">
      <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:0.3em;color:#6b6860;text-transform:uppercase">Mathematics Melee</p>
      <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:20px;color:#f4f1ea;letter-spacing:0.14em;text-transform:uppercase">The Limit Point</p>
    </td></tr>
    <tr><td style="background:#ffffff;border-left:1px solid #e8e4dc;border-right:1px solid #e8e4dc;padding:40px 36px;text-align:center">
      <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:15px;color:#37352f">Hi ${name},</p>
      <p style="margin:0 0 28px;font-family:sans-serif;font-size:13px;color:#9a9690;line-height:1.6">Your one-time code to enter the Limit Point portal:</p>
      <div style="background:#f4f1ea;border:1px solid #d9d4c9;border-radius:10px;padding:20px 32px;display:inline-block;margin-bottom:28px">
        <span style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.18em;color:#1b1a17">${otp}</span>
      </div>
      <p style="margin:0;font-family:sans-serif;font-size:12px;color:#b3afa4">Expires in 10 minutes. Do not share this code.</p>
    </td></tr>
    <tr><td style="background:#1b1a17;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center">
      <p style="margin:0;font-family:sans-serif;font-size:10px;color:#4a4845;letter-spacing:0.14em;text-transform:uppercase">Polygon · IIT Guwahati · Summer 2026</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await client.transactionalEmails.sendTransacEmail({
      to: [{ email: to, name }],
      sender: {
        email: process.env.BREVO_FROM_EMAIL ?? "noreply@mathsmelee.app",
        name: process.env.BREVO_FROM_NAME ?? "Mathematics Melee ‘26",
      },
      subject: `${otp} — Your Limit Point access code`,
      htmlContent: html,
    });
  } catch (err) {
    console.error("[email] Failed to send OTP:", err);
    throw err;
  }
}

export async function sendWelcomeEmail(to: string, name: string, college: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://mathsmelee.app";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to The Limit Point — Mathematics Melee</title>
<style>
@font-face {
  font-family: 'Pestapora';
  src: url('${base}/fonts/Pestapora.otf') format('opentype');
  font-weight: 400; font-style: normal;
}
@font-face {
  font-family: 'CMUSans';
  src: url('${base}/fonts/CMUSans-Regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}
@font-face {
  font-family: 'CMUSans';
  src: url('${base}/fonts/CMUSans-Bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}
@font-face {
  font-family: 'Montserrat';
  src: url('${base}/fonts/Montserrat.ttf') format('truetype');
  font-weight: 600; font-style: normal;
}
</style>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:48px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px">

  <tr><td style="text-align:right;padding-bottom:10px">
    <span style="font-family:'CMUSans',sans-serif;font-size:10px;color:#b3afa4;letter-spacing:0.14em">Mathematics Melee &rsquo;26</span>
  </td></tr>

  <tr><td style="background:#faf8f4;border:1px solid #e0dbd1;border-radius:4px;padding:52px 60px 44px;position:relative">

    <!-- Math motifs -->
    <div style="position:absolute;top:28px;left:28px;font-family:'CMUSans',Georgia,serif;font-size:44px;color:#1b1a17;opacity:0.055;line-height:1">&Sigma;</div>
    <div style="position:absolute;top:28px;right:28px;font-family:'CMUSans',Georgia,serif;font-size:44px;color:#1b1a17;opacity:0.055;line-height:1">&int;</div>
    <div style="position:absolute;bottom:80px;left:28px;font-family:'CMUSans',Georgia,serif;font-size:28px;color:#1b1a17;opacity:0.04;line-height:1">&pi;</div>
    <div style="position:absolute;bottom:80px;right:28px;font-family:'CMUSans',Georgia,serif;font-size:28px;color:#1b1a17;opacity:0.04;line-height:1">&infin;</div>

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:16px">
      <img src="${base}/logo.jpeg" width="52" height="52" alt="Mathematics Melee" style="border-radius:10px;display:inline-block">
    </div>

    <!-- MATHEMATICS MELEE — Montserrat caps -->
    <p style="margin:0;text-align:center;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#1b1a17">Mathematics Melee</p>
    <!-- by Polygon -->
    <p style="margin:5px 0 0;text-align:center;font-family:'Montserrat',sans-serif;font-size:8.5px;font-weight:500;letter-spacing:0.24em;text-transform:uppercase;color:#8a877e">by Polygon &middot; IIT Guwahati</p>

    <!-- The Limit Point — Pestapora script -->
    <p style="margin:6px 0 0;text-align:center;font-family:'Pestapora',Georgia,serif;font-size:48px;font-weight:400;color:#1b1a17;line-height:1;font-style:normal">The Limit Point</p>

    <!-- WELCOME TO THE FINALS label -->
    <p style="margin:20px 0 0;text-align:center;font-family:'Montserrat',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;color:#b07d2e">Welcome to the Finals</p>

    <!-- Divider -->
    <div style="width:60px;height:1px;background:#d9d4c9;margin:24px auto 28px"></div>

    <!-- Dear -->
    <p style="margin:0 0 12px;text-align:center;font-family:'CMUSans',sans-serif;font-size:14px;color:#6e6b65">Dear</p>

    <!-- Name — large CMU Sans Bold -->
    <p style="margin:0 0 8px;text-align:center;font-family:'CMUSans',sans-serif;font-size:44px;font-weight:700;color:#1b1a17;line-height:1.05">${name}</p>

    <!-- Name underline -->
    <div style="width:220px;height:1px;background:#c8c3ba;margin:0 auto 28px"></div>

    <!-- Body -->
    <p style="margin:0;text-align:center;font-family:'CMUSans',sans-serif;font-size:15px;font-weight:400;color:#37352f;line-height:1.75;max-width:440px;margin-left:auto;margin-right:auto">
      has converged to <span style="color:#b07d2e;font-weight:700">The Limit Point</span> &mdash; the final round of the
      Mathematics Melee &rsquo;26 Supremum Series &mdash; and is hereby recognised among the
      <strong>Finalists, the chosen few.</strong>
    </p>

    ${college ? `<p style="margin:18px 0 0;text-align:center;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9a9690">${college}</p>` : ""}

    <div style="width:60px;height:1px;background:#d9d4c9;margin:32px auto 24px"></div>

    <p style="margin:0;text-align:center;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#b3afa4">
      Summer 2026 &nbsp;&middot;&nbsp; IIT Guwahati &nbsp;&middot;&nbsp; Polygon Mathematics Society
    </p>

  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  await client.transactionalEmails.sendTransacEmail({
    to: [{ email: to, name }],
    sender: {
      email: process.env.BREVO_FROM_EMAIL ?? "noreply@mathsmelee.app",
      name: process.env.BREVO_FROM_NAME ?? "Mathematics Melee '26",
    },
    subject: `Welcome to The Limit Point — Mathematics Melee '26`,
    htmlContent: html,
  });
}
