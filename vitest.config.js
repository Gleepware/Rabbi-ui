import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const markdownStub = () => ({
  name: "markdown-stub",
  resolveId(id) {
    if (id.endsWith(".md")) return id;
  },
  load(id) {
    if (id.endsWith(".md")) {
      return "export default function Markdown() { return null; }";
    }
  },
});

export default defineConfig({
  plugins: [react(), markdownStub()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.js"],
  },
});