import { existsSync, renameSync, rmSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function flattenApkIndex(): Plugin {
  return {
    name: "flatten-apk-index",
    closeBundle() {
      const from = fileURLToPath(new URL("./apk-www/apk/index.html", import.meta.url));
      const to = fileURLToPath(new URL("./apk-www/index.html", import.meta.url));
      if (!existsSync(from)) return;
      renameSync(from, to);
      rmSync(fileURLToPath(new URL("./apk-www/apk", import.meta.url)), { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  envPrefix: ["VITE_"],
  define: {
    "import.meta.env.VITE_QUIRE_APK": JSON.stringify("1"),
  },
  plugins: [viteReact(), tailwindcss(), flattenApkIndex()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "apk-www",
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./apk/index.html", import.meta.url)),
    },
  },
});
