"use node";

import { action } from "./_generated/server";

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export const getIceServers = action({
  args: {},
  handler: async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error(
        "Twilio credentials not configured. Run `npx convex env set TWILIO_ACCOUNT_SID ...` and `TWILIO_AUTH_TOKEN ...`.",
      );
    }

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString(
      "base64",
    );

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Tokens.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Twilio token request failed: ${response.status}`);
    }

    const data = await response.json();

    const iceServers: IceServer[] = data.ice_servers.map((server: any) => ({
      urls: server.urls ?? server.url,
      username: server.username,
      credential: server.credential,
    }));

    return iceServers;
  },
});
