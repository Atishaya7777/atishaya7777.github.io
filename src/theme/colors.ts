// Paper-matte academic palette tinted around the site's signature aubergine:
// violet-cast ivory paper, plum-black ink, and deep plum accent links.
// Low-numbered shades are for light mode paper / dark mode ink; high-numbered
// shades are the inverse.
const colors = {
	paper: {
		50: '#FAF8F9', // raised surfaces (light)
		100: '#F5F3F5', // page background (light)
		200: '#EBE7EC', // subtle fills, badges (light)
		300: '#DFD9E0', // hover fills (light)
		800: '#211A23', // raised surfaces (dark)
		900: '#171218', // page background (dark)
	},
	ink: {
		100: '#ECE7ED', // headings (dark mode)
		200: '#CEC7D0', // body (dark mode)
		300: '#A69DA8', // secondary (dark mode)
		400: '#6F6671', // faint metadata (light mode) — darkest value that keeps ≥4.5:1 on paper-100
		500: '#5C545E', // secondary (light mode)
		700: '#4A414B', // body (light mode)
		900: '#251C26', // headings (light mode)
	},
	accent: {
		200: '#DDBFE1', // link hover (dark mode)
		300: '#C9A3CE', // links (dark mode)
		600: '#5C2E60', // links (light mode)
		700: '#451F49', // link hover (light mode)
	},
	rule: {
		DEFAULT: '#DED8DF', // hairlines (light)
		strong: '#C7BEC8',
		dark: '#3C3340', // hairlines (dark)
		'dark-strong': '#57495B',
	},
};

export default colors;
