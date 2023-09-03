const keyframes = {
	'svg-stroke-draw': {
		'0%': {
			'stroke-dashoffset': 1000,
			'fill-opacity': 0,
		},
		'100%': {
			'stroke-dashoffset': 0,
			'fill-opacity': 1,
		},
	},
	'move-vertically': {
		'0%': {
			transform: 'translateX(0)',
		},
		'50%': {
			transform: 'translateX(3.25rem)',
		},
		'100%': {
			transform: 'translateX(0)',
		},
	},
};

export default keyframes;
