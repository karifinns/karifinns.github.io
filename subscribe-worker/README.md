# Subscribe Worker

Lítill Cloudflare Worker sem sér um:

- `POST /subscribe`
- `GET /confirm?token=...`
- double opt-in flæði með Resend
- skráningu Contacts í Topic fyrir ný skrif

## Umhverfisbreytur

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TOPIC_ID`
- `SIGNING_SECRET`
- `SITE_URL`
- `SUBSCRIBE_BASE_URL`
- `RESEND_REPLY_TO` (optional)

## Ræsa staðbundið

```bash
npm install
npm run dev
```

## Birta

```bash
npm run deploy
```
