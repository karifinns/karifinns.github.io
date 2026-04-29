/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUBSCRIBE_FORM_ACTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
