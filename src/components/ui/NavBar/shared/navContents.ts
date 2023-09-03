import { FunctionComponent, SVGProps } from 'react';
import { routePaths } from 'global';

interface INavContent {
	path: string;
	label: string;
	icon?: FunctionComponent<
		SVGProps<SVGSVGElement> & {
			title?: string | undefined;
		}
	>;
}

const navContents: INavContent[] = [
	{
		path: routePaths.home,
		label: 'Atishaya Maharjan.',
		icon: undefined,
	},
	{
		path: '#' + routePaths.about,
		label: 'About',
		icon: undefined,
	},
	{
		path: '#' + routePaths.work,
		label: 'Work',
		icon: undefined,
	},
	{
		path: '#' + routePaths.contact,
		label: 'Contact Me',
		icon: undefined,
	},
];

export default navContents;
