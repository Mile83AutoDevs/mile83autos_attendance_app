import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // allows PWA in dev mode
      },
      manifest: {
        name: "Clockin",
        short_name: "Clockin",
        description: "Mile83autos attendance clock-in app",
        theme_color: "#FDDF52",
        background_color: "#FDDF52",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/small.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/big.png",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
