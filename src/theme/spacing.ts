// Sophisticated spacing system for modern layouts
const spacing = {
	'fluid-xs': 'clamp(0.5rem, 2vw, 1rem)',
	'fluid-sm': 'clamp(1rem, 3vw, 1.5rem)',
	'fluid-md': 'clamp(1.5rem, 4vw, 2.5rem)',
	'fluid-lg': 'clamp(2rem, 6vw, 4rem)',
	'fluid-xl': 'clamp(3rem, 8vw, 6rem)',
	'fluid-2xl': 'clamp(4rem, 12vw, 8rem)',
};

const maxWidth = {
	'content': '65ch',
	'prose': '75ch',
	'reading': '85ch',
};

export { spacing, maxWidth };
