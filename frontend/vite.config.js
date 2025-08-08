// frontend/vite.config.js
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  // 【修正處】加入 resolve.alias 設定，告訴 Vite 路徑別名的規則
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})