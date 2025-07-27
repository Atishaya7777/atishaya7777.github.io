import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  site: `https://www.atishaya7777.github.io`,
  output: 'static',
  outDir: './dist',
  image: {
    service: passthroughImageService()
  },
  build: {
    assets: 'astro'
  }
});