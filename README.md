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

Fyrir þetta repository nafn er production-slóðin sjálfgefið `https://karifinns.github.io`.

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
