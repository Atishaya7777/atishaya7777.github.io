// Modern animation system inspired by award-winning sites
const animation = {
	'fade-in': 'fadeIn 0.6s ease-out',
	'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
	'slide-down': 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
	'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
	'reveal': 'reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
	'float': 'float 6s ease-in-out infinite',
	'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
};

const keyframes = {
	fadeIn: {
		'0%': { opacity: '0' },
		'100%': { opacity: '1' },
	},
	slideUp: {
		'0%': { transform: 'translateY(2rem)', opacity: '0' },
		'100%': { transform: 'translateY(0)', opacity: '1' },
	},
	slideDown: {
		'0%': { transform: 'translateY(-2rem)', opacity: '0' },
		'100%': { transform: 'translateY(0)', opacity: '1' },
	},
	scaleIn: {
		'0%': { transform: 'scale(0.95)', opacity: '0' },
		'100%': { transform: 'scale(1)', opacity: '1' },
	},
	reveal: {
		'0%': { transform: 'translateY(3rem) scale(0.98)', opacity: '0' },
		'100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
	},
	float: {
		'0%, 100%': { transform: 'translateY(0px)' },
		'50%': { transform: 'translateY(-10px)' },
	},
	pulseSubtle: {
		'0%, 100%': { opacity: '1' },
		'50%': { opacity: '0.8' },
	},
};

const transitionTimingFunction = {
	'ease-elastic': 'cubic-bezier(0.16, 1, 0.3, 1)',
	'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
	'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export { animation, keyframes, transitionTimingFunction };
