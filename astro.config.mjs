import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  site: `https://atishaya7777.github.io`,
  output: 'static',
  outDir: './dist',
  image: {
    service: passthroughImageService()
  },
  build: {
    assets: 'astro'
  }
});
