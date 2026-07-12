/** @type {import('tailwindcss').Config} */

import colors from './src/theme/colors';
import { fontFamily } from './src/theme/fonts';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors,
			fontFamily,
		},
	},
	plugins: [],
}
