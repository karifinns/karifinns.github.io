interface Env {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_REPLY_TO?: string;
  RESEND_TOPIC_ID: string;
  SIGNING_SECRET: string;
  SITE_URL: string;
  SUBSCRIBE_BASE_URL: string;
}

const RESEND_API_URL = "https://api.resend.com";
const tokenLifetimeSeconds = 60 * 60 * 48;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscriptionToken = {
  email: string;
  exp: number;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/subscribe") {
        return await handleSubscribe(request, env);
      }

      if (request.method === "GET" && url.pathname === "/confirm") {
        return await handleConfirm(url, env);
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      return page(
        "Áskrift",
        "<p>Þessi endapunktur sér um skráningu og staðfestingu á tölvupóstáskrift.</p>"
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Óþekkt villa";

      return page(
        "Eitthvað fór úrskeiðis",
        `<p>Ekki tókst að ljúka aðgerðinni núna. Reyndu aftur síðar.</p><p><small>${escapeHtml(
          message
        )}</small></p>`,
        500
      );
    }
  }
};

async function handleSubscribe(request: Request, env: Env) {
  assertEnv(env);

  const contentType = request.headers.get("content-type") ?? "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  const payload = isForm ? await request.formData() : await request.json();
  const rawEmail = isForm ? payload.get("email") : payload.email;
  const honeypot = isForm ? payload.get("website") : payload.website;
  const email = normalizeEmail(String(rawEmail ?? ""));

  if (honeypot) {
    return page(
      "Athugaðu pósthólfið",
      "<p>Ef netfangið er gilt færðu staðfestingarpóst innan skamms.</p>"
    );
  }

  if (!emailPattern.test(email)) {
    return page(
      "Ógilt netfang",
      "<p>Netfangið virtist ekki gilt. Athugaðu innsláttinn og reyndu aftur.</p>",
      400
    );
  }

  const token = await signToken(
    {
      email,
      exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds
    },
    env.SIGNING_SECRET
  );

  const confirmUrl = new URL("/confirm", env.SUBSCRIBE_BASE_URL);
  confirmUrl.searchParams.set("token", token);

  await resendRequest(
    "/emails",
    {
      method: "POST",
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [email],
        subject: "Staðfestu áskrift að nýjum skrifum",
        html: confirmationEmailHtml(confirmUrl.toString(), env.SITE_URL),
        text: confirmationEmailText(confirmUrl.toString(), env.SITE_URL),
        ...(env.RESEND_REPLY_TO ? { reply_to: env.RESEND_REPLY_TO } : {})
      })
    },
    env
  );

  return page(
    "Athugaðu pósthólfið",
    "<p>Ef netfangið er gilt færðu staðfestingarpóst innan skamms. Áskriftin verður virk þegar smellt hefur verið á hlekkinn í póstinum.</p>"
  );
}

async function handleConfirm(url: URL, env: Env) {
  assertEnv(env);

  const token = url.searchParams.get("token");

  if (!token) {
    return page("Ógild staðfesting", "<p>Staðfestingarhlekkurinn vantar eða er ógildur.</p>", 400);
  }

  const data = await verifyToken(token, env.SIGNING_SECRET);

  if (!data || data.exp < Math.floor(Date.now() / 1000)) {
    return page(
      "Hlekkur útrunninn",
      "<p>Staðfestingarhlekkurinn er útrunninn eða ógildur. Reyndu að skrá netfangið aftur.</p>",
      400
    );
  }

  await ensureContactSubscription(data.email, env);

  return page(
    "Áskrift staðfest",
    "<p>Netfangið hefur verið skráð á listann og þú færð tilkynningu þegar ný skrif birtast.</p>"
  );
}

async function ensureContactSubscription(email: string, env: Env) {
  const properties = {
    signup_source: "website",
    signup_confirmed_at: new Date().toISOString()
  };

  const created = await resendRequest(
    "/contacts",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        unsubscribed: false,
        properties,
        topics: [
          {
            id: env.RESEND_TOPIC_ID,
            subscription: "opt_in"
          }
        ]
      })
    },
    env,
    true
  );

  if (created.ok) {
    return;
  }

  await resendRequest(
    `/contacts/${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        unsubscribed: false,
        properties
      })
    },
    env
  );

  await resendRequest(
    `/contacts/${encodeURIComponent(email)}/topics`,
    {
      method: "PATCH",
      body: JSON.stringify({
        topics: [
          {
            id: env.RESEND_TOPIC_ID,
            subscription: "opt_in"
          }
        ]
      })
    },
    env
  );
}

async function resendRequest(path: string, init: RequestInit, env: Env, allowFailure = false) {
  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (response.ok || allowFailure) {
    return response;
  }

  const message = await response.text();
  throw new Error(`Resend request failed (${response.status}) for ${path}: ${message}`);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function assertEnv(env: Env) {
  const required = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "RESEND_TOPIC_ID",
    "SIGNING_SECRET",
    "SITE_URL",
    "SUBSCRIBE_BASE_URL"
  ] as const;

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

async function signToken(data: SubscriptionToken, secret: string) {
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify(data)));
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

async function verifyToken(token: string, secret: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = await hmac(payload, secret);

  if (!timingSafeEqual(signature, expected)) {
    return null;
  }

  try {
    const json = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
    return json as SubscriptionToken;
  } catch {
    return null;
  }
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64urlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

function base64urlEncode(input: Uint8Array) {
  const binary = Array.from(input, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function confirmationEmailHtml(confirmUrl: string, siteUrl: string) {
  const safeConfirmUrl = escapeHtml(confirmUrl);
  const safeSiteUrl = escapeHtml(siteUrl);

  return `
    <div style="font-family: Georgia, serif; line-height: 1.6; color: #2a241f;">
      <p>Smelltu á hlekkinn hér fyrir neðan til að staðfesta áskrift að tilkynningum um ný skrif á <a href="${safeSiteUrl}">${safeSiteUrl}</a>.</p>
      <p><a href="${safeConfirmUrl}">Staðfesta áskrift</a></p>
      <p>Ef þú baðst ekki um þetta geturðu hunsað þennan póst.</p>
    </div>
  `;
}

function confirmationEmailText(confirmUrl: string, siteUrl: string) {
  return [
    `Staðfestu áskrift að tilkynningum um ný skrif á ${siteUrl}.`,
    "",
    `Staðfestingarhlekkur: ${confirmUrl}`,
    "",
    "Ef þú baðst ekki um þetta geturðu hunsað þennan póst."
  ].join("\n");
}

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="is">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        padding: 3rem 1.25rem;
        background: #f3eee5;
        color: #2a241f;
        font-family: Georgia, serif;
        line-height: 1.7;
      }
      main {
        width: min(100%, 35rem);
        margin: 0 auto;
      }
      h1 {
        font-weight: 400;
        font-size: clamp(2rem, 7vw, 3rem);
        line-height: 1.1;
        margin: 0 0 1rem;
      }
      p {
        margin: 0 0 1rem;
      }
      a {
        color: inherit;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      ${body}
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    }
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
