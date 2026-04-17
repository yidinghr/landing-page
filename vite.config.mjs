import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function copyRootImageDirectory() {
  return {
    name: "copy-root-image-directory",
    closeBundle() {
      const sourceDir = resolve(process.cwd(), "image");
      const targetDir = resolve(process.cwd(), "dist/image");

      if (!existsSync(sourceDir)) {
        return;
      }

      cpSync(sourceDir, targetDir, { recursive: true, force: true });
    }
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [copyRootImageDirectory()],
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
