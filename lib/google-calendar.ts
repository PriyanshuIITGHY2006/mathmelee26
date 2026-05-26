// lib/google-calendar.ts
import { google } from "googleapis";

/**
 * Build an authenticated Google Calendar client using a stored refresh token.
 * The access_token is refreshed automatically by the googleapis library.
 */
export function getCalendarClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CreateMeetEventParams {
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  attendeeEmails?: string[];
}

/**
 * Creates a Google Calendar event with a Meet conference link.
 * Returns the generated hangoutLink (Google Meet URL).
 */
export async function createMeetEvent(
  refreshToken: string,
  params: CreateMeetEventParams
): Promise<{ eventId: string; meetLink: string }> {
  const calendar = getCalendarClient(refreshToken);

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startDateTime,
        timeZone: "Asia/Kolkata", // Adjust to your timezone
      },
      end: {
        dateTime: params.endDateTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: params.attendeeEmails?.map((email) => ({ email })) ?? [],
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: { type: "hangoutsMeet" },
          requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      },
    },
  });

  const meetLink =
    event.data.hangoutLink ??
    event.data.conferenceData?.entryPoints?.[0]?.uri ??
    "";

  return {
    eventId: event.data.id!,
    meetLink,
  };
}
