import { defineConfig, passthroughImageService } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: `https://www.atishaya7777.github.io`,
  output: 'static',
  outDir: './dist',
  image: {
    service: passthroughImageService(),
  },
  build: {
    assets: 'astro'
  }
});
