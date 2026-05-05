# Kári Finnsson

Hljóðlát, textamiðuð persónuleg vefsíða byggð með Astro og ætluð til statískrar birtingar á GitHub Pages.

## Tæknistakkur

- Astro
- TypeScript
- Markdown content collections
- Statísk keyrsla
- GitHub Actions fyrir birtingu

## Keyra staðbundið

1. Settu upp Node.js 20 eða nýrra.
2. Settu upp pakkana:

```bash
npm install
```

3. Ræstu þróunarþjóninn:

```bash
npm run dev
```

4. Opnaðu staðbundnu slóðina sem birtist í skelinni.

## Byggja

Búðu til production-útgáfu með:

```bash
npm run build
```

Forskoðaðu byggðu síðuna staðbundið með:

```bash
npm run preview
```

## Google Analytics

Vefurinn styður Google Analytics 4 með Google tag (`gtag.js`). Kóðinn hleðst aðeins inn þegar public build-breytan `PUBLIC_GA_MEASUREMENT_ID` er stillt.

### Hvernig þú finnur Measurement ID

Í Google Analytics 4:

1. Farðu í `Admin`
2. Opnaðu `Data streams`
3. Veldu vefstreymið fyrir síðuna
4. Afritaðu `Measurement ID` sem byrjar á `G-`

Google mælir með að setja Google tag inn beint eftir `<head>` á öllum síðum og nota Measurement ID úr web data stream. Sjá leiðbeiningar:

- [Set up Analytics for a website and/or app](https://support.google.com/analytics/answer/9304153)
- [Find your Google tag ID](https://support.google.com/analytics/answer/9539598)

### Staðbundin þróun

Til að prófa þetta staðbundið:

```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run dev
```

### GitHub Pages

Í GitHub repository:

1. Farðu í `Settings` -> `Secrets and variables` -> `Actions`
2. Bættu við repository variable sem heitir `PUBLIC_GA_MEASUREMENT_ID`
3. Settu gildið sem Measurement ID úr Google Analytics (`G-...`)
4. Pushaðu á `main` eða rerun-aðu Pages workflow

Þegar breytan er stillt birtist GA4 tagið sjálfkrafa í `<head>` á öllum síðum.

## Tölvupóstáskrift fyrir ný skrif

Vefurinn styður nú áskriftarform fyrir tilkynningar um ný skrif. Lausnin skiptist í tvennt:

- Astro-síðan birtir form og sendir notandann á áskriftarenda
- Cloudflare Worker sér um double opt-in og samskipti við Resend

### Formið á síðunni

Formið birtist á forsíðu og á `Skrif` síðunni þegar build-breytan `PUBLIC_SUBSCRIBE_FORM_ACTION` er stillt.

Dæmi í staðbundinni þróun:

```bash
PUBLIC_SUBSCRIBE_FORM_ACTION=https://updates.finnsson.co/subscribe npm run dev
```

Í GitHub Actions er sama gildi lesið úr repository variable sem heitir `PUBLIC_SUBSCRIBE_FORM_ACTION`.

### Worker fyrir áskrift

Í `subscribe-worker/` er lítill Cloudflare Worker sem:

- tekur við `POST /subscribe`
- sendir staðfestingarpóst með Resend
- staðfestir netfang með `GET /confirm?token=...`
- býr til eða uppfærir Contact í Resend
- skráir Contact í Topic fyrir ný skrif

Fljótleg uppsetning:

1. Farðu í `subscribe-worker/`
2. Keyrðu `npm install`
3. Stilltu environment variables / secrets í Cloudflare
4. Keyrðu `npm run dev` eða `npm run deploy`

Breytur sem þarf:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TOPIC_ID`
- `SIGNING_SECRET`
- `SITE_URL`
- `SUBSCRIBE_BASE_URL`
- `RESEND_REPLY_TO` (optional)

### Resend stillingar

Í Resend þarftu að:

1. Búa til Topic fyrir ný skrif
2. Afrita `topic id`
3. Nota staðfest `from` netfang
4. Senda ný innlegg út sem Broadcasts á þetta Topic

## Efni í skrifum

Skrifafærslur eru geymdar í `src/content/writing/`.

Hver færsla notar Astro content collections með sannprófun á schema og styður:

- `title`
- `description`
- `publishDate`
- `updatedDate` (optional)
- `tags`
- `draft`

Draft entries are excluded from production lists and production page generation.
Drög eru útilokuð úr production-listum og production-síðugerð.

## Birting á GitHub Pages

Í þessu repository er GitHub Actions workflow í `.github/workflows/deploy.yml`.

Til að birta á GitHub Pages:

1. Pushaðu repository-inu á GitHub.
2. Opnaðu `Settings` -> `Pages` í GitHub.
3. Stilltu source sem `GitHub Actions`.
4. Pushaðu á `main`.

Workflow-ið mun:

- setja upp pakkana
- byggja Astro-síðuna
- hlaða upp statísku úttaki
- birta á GitHub Pages

## Athugasemd um grunnslóð

Astro-stillingarnar styðja sjálfkrafa bæði:

- user/organization síður eins og `https://karifinns.github.io`
- project síður eins og `https://username.github.io/repository-name`

Í þessu repository er production-slóðin `https://finnsson.co`.

## Verkefnaskipan

```text
src/
  components/
  content/
    writing/
  layouts/
  lib/
  pages/
.github/
  workflows/
public/
```
