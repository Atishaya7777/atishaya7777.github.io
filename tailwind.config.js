/** @type {import('tailwindcss').Config} */

import { animations, keyframes } from './src/theme';

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
		},
	},
	plugins: [],
};
