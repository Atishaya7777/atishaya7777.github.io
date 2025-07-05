const fontFamily = {
	'helvetica-now': ['"Helvetica-Now"', 'serif'],
	'display': ['"Helvetica-Now"', 'ui-serif', 'Georgia', 'serif'],
	'body': ['"Helvetica-Now"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
	'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
};

const fontWeight = {
	hairline: 100,
	thin: 200,
	'extra-light': 300,
	light: 400,
	regular: 500,
	medium: 600,
	bold: 700,
	'extra-bold': 800,
	black: 900,
};

// Modern type scale for sophisticated typography
const fontSize = {
	'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
	'display-lg': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
	'display-md': ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
	'display-sm': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
	h1: ['30px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
	h2: ['24px', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
	h3: ['20px', { lineHeight: '1.35' }],
	h4: ['18px', { lineHeight: '1.4' }],
	'body-xl': ['20px', { lineHeight: '1.6' }],
	'body-lg': ['18px', { lineHeight: '1.6' }],
	'body-md': ['16px', { lineHeight: '1.6' }],
	'body-sm': ['14px', { lineHeight: '1.5' }],
	'caption': ['12px', { lineHeight: '1.4' }],
	'subtitle-1': ['34px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
	'subtitle-2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
	'body-1': ['20px', { lineHeight: '1.6' }],
	'body-2': ['18px', { lineHeight: '1.6' }],
	button: ['16px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
};

export { fontFamily, fontWeight, fontSize };
