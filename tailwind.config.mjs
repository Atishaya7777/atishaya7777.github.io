/** @type {import('tailwindcss').Config} */

import * as theme from './src/theme';
const plugin = require('tailwindcss/plugin');

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			...theme,
			// Add animation utilities
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
				'float': 'float 6s ease-in-out infinite',
				'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(2rem)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				pulseSubtle: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
			},
			// Enhanced transitions
			transitionTimingFunction: {
				'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
			}
		},
	},
	plugins: [
		plugin(function({ addBase, addComponents, addUtilities, theme }) {
			addBase({
				'h1': { fontSize: theme('fontSize.h1') },
				'h2': { fontSize: theme('fontSize.h2') },
				'h3': { fontSize: theme('fontSize.h3') },
			});
			
			addComponents({
				'.animate-on-scroll': {
					opacity: '0',
					transform: 'translateY(2rem)',
					transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
				},
				'.animate-on-scroll.visible': {
					opacity: '1',
					transform: 'translateY(0)',
				},
			});
			
			addUtilities({
				'.text-balance': {
					'text-wrap': 'balance',
				},
			});
		})
	],
}
