import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    // https: true,
    port: 3001,
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
