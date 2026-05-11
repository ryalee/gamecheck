let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getIgdbToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("Missing TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET env vars");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(TWITCH_CLIENT_ID)}&client_secret=${encodeURIComponent(TWITCH_CLIENT_SECRET)}&grant_type=client_credentials`,
    { method: "POST" },
  );

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data?.access_token) {
    throw new Error("Failed to obtain IGDB token");
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 0) * 1000;
  return cachedToken;
}
