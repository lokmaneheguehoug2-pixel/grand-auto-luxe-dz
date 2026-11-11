// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { loadEnv } from "vite";

const localEnv = {
  ...loadEnv("development", process.cwd(), ""),
  ...loadEnv("production", process.cwd(), ""),
};
const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.apiKey || localEnv.VITE_FIREBASE_API_KEY || localEnv.apiKey;
const isNetlifyBuild = process.env.NETLIFY === "true";

export default defineConfig({
  plugins: isNetlifyBuild ? [netlify()] : [],
  vite: {
    define: firebaseApiKey ? { "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(firebaseApiKey) } : {},
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: isNetlifyBuild ? false : { preset: "vercel" },
});
