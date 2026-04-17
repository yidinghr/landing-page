import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  server: {
    host: "127.0.0.1",
    port: 4173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        login: resolve(process.cwd(), "index.html"),
        dashboard: resolve(process.cwd(), "home/home.html"),
        employees: resolve(process.cwd(), "home/employees.html"),
        schedule: resolve(process.cwd(), "home/edit/index.html")
      }
    }
  }
});
