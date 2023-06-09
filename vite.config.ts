import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [react({ babel: { babelrc: true } }), tsconfigPaths(), svgr()],
    build: {
      outDir: "build",
    },
    define: {
      "process.env.NODE_ENV": `"${mode}"`,
    },
    server: {
      port: 3000,
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
  });
