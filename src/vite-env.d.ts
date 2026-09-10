/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUIRE_APK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
