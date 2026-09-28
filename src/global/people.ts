// Supervisors, collaborators, and research groups linked across the site.
// Keep URLs here so every page points to the same place.

export type Person = { name: string; url: string };

export const linkClass =
	'text-accent-600 dark:text-accent-300 hover:text-accent-700 dark:hover:text-accent-200 transition-colors';

export const people = {
	durocher: { name: 'Dr. Stephane Durocher', url: 'https://home.cs.umanitoba.ca/~durocher/' },
	naredla: { name: 'Dr. Anurag Murty Naredla', url: 'https://sites.google.com/view/anuragmurty/home' },
	zhu: { name: 'Dr. Leqi (Jimmy) Zhu', url: 'https://umanitoba.ca/science/directory/computer-science/jimmy-zhu' },
	miller: { name: 'Dr. Avery Miller', url: 'https://home.cs.umanitoba.ca/~amiller/' },
	henry: { name: 'Dr. Christopher Henry', url: 'https://umanitoba.ca/science/directory/computer-science/christopher-henry' },
	sayari: { name: 'Dr. Mohammad Sayari', url: 'https://www.researchgate.net/profile/Mohammad-Sayari-2' },
	salehkalaibar: { name: 'Dr. Sadaf Salehkalaibar', url: 'https://umanitoba.ca/science/directory/computer-science/sadaf-salehkalaibar' },
	arman: { name: 'Dr. Andrii Arman', url: 'https://sites.google.com/view/a-arman/home' },
	shirazi: { name: 'Dr. Mahsa N. Shirazi', url: 'https://www.mshirazi.com/' },
} satisfies Record<string, Person>;

export const groups = {
	gada: { name: 'GADA Lab (Geometric, Approximation & Distributed Algorithms)', url: 'https://home.cs.umanitoba.ca/~gada/' },
	mxml: { name: 'Manitoba eXperimental Mathematics Laboratory (MXML)', url: 'https://sites.google.com/view/mxml/home' },
	terrabyte: { name: 'Terrabyte Machine Learning Research Group', url: 'https://terrabyte.acs.uwinnipeg.ca/' },
};

export const refs = {
	walcom2025: {
		label: 'WALCOM 2025',
		url: 'https://link.springer.com/chapter/10.1007/978-981-96-2845-2_5',
	},
};

/** HTML anchor string, for text rendered with set:html. */
export const a = (url: string, text: string) =>
	`<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${text}</a>`;

/** "A", "A & B", "A, B & C" with each name linked. */
export const peopleHtml = (list: Person[]) => {
	const links = list.map((p) => a(p.url, p.name));
	if (links.length <= 1) return links.join('');
	return `${links.slice(0, -1).join(', ')} &amp; ${links[links.length - 1]}`;
};
