/** @type {import('tailwindcss').Config} */

import * as theme from './src/theme';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			...theme
		},
	},
	plugins: [],
}
