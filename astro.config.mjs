import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// NOTE: Following this link to change the config to deploy to github pages: https://www.cmsoftdev.com/01-github-deploy/
	integrations: [],
	site: `https//www.atishaya7777.github.io`,
	output: 'static',
	outDir: './docs',
	build: {
		assets: 'astro'
	}
});
