interface Props {
	name: 'arrow-right' | 'chevron';
	className?: string;
}

export default function DirectoryIcon({ name, className = '' }: Props) {
	const classNames = `inline-block shrink-0 align-[-0.125em] ${className}`;
	const shared = {
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: '0 0 24 24',
		width: '1em',
		height: '1em',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 1.75,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
		className: classNames,
		'aria-hidden': true as const,
		focusable: false as const,
	};
	if (name === 'chevron') {
		return (
			<svg {...shared}>
				<path d="m6 9 6 6 6-6" />
			</svg>
		);
	}
	return (
		<svg {...shared}>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}
