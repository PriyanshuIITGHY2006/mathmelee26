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
        name: process.env.BREVO_FROM_NAME ?? "Mathematics Melee '26",
      },
      subject: `Your Meet Link — Mathematics Melee ’26 · ${day}, ${date} ${startTime}`,
      htmlContent: html,
    });
  } catch (err) {
    console.error("[email] Failed to send meet link:", err);
  }
}
