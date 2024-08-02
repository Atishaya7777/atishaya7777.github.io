/** @type {import('tailwindcss').Config} */

import * as theme from './src/theme';
const plugin = require('tailwindcss/plugin');

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'selector',
	theme: {
		extend: {
			...theme
		},
	},
	plugins: [
		plugin(function({ addBase, theme }) {
			addBase({
				'h1': { fontSize: theme('fontSize.h1') },
				'h2': { fontSize: theme('fontSize.h2') },
				'h3': { fontSize: theme('fontSize.h3') },
			})
		})
	],
}
