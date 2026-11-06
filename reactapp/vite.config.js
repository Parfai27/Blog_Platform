import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Set API_URL to point the dev server at an API on another port.
      "/api": {
        target: process.env.API_URL || "http://localhost:1000",
        changeOrigin: true,
      },
    },
  },
})
