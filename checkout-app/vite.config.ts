import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173 },
  // Suporte a aparelhos antigos: iOS 13+ (Safari 13) e Android 8+ (Chrome 64+)
  build: {
    target: ["es2017", "safari13", "chrome64", "firefox78", "edge79"],
    cssTarget: ["safari13", "chrome64"],
  },
});
