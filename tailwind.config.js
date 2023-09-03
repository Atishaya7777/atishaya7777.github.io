/** @type {import('tailwindcss').Config} */

import { animations, colors, fonts, keyframes } from './src/theme';

export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			keyframes: {
				...keyframes,
			},
			animations: {
				...animations,
			},
			fontFamily: {
				...fonts,
			},
			colors: {
				...colors,
			},
		},
	},
	plugins: [],
};
