import {
	IconLink,
	ImgEkNepalLogoDefault,
	ImgTimeeroLogoDefault,
	ImgVersuredLogoDefault,
} from 'assets';
import { Container } from 'components';
import { routePaths } from 'global';

const Works = () => {
	interface IWorkContents {
		logo: string;
		heading: string;
		desc: string;
		link: string;
	}

	const workContents: IWorkContents[] = [
		{
			logo: ImgTimeeroLogoDefault,
			heading: 'Timeero - Time tracker',
			desc: 'GPS Time Tracking & Mileage Tracking for Employees',
			link: 'https://timeero.com/',
		},
		{
			logo: ImgVersuredLogoDefault,
			heading: 'Versured - Online insurance portal',
			desc: 'One portal for all your insurance needs',
			link: 'https://versured.com/',
		},
		{
			logo: ImgEkNepalLogoDefault,
			heading: 'EkNepal',
			desc: 'Truthful news aggregator',
			link: 'https://eknepal.com/',
		},
	];

	return (
		<Container containerId={routePaths.work}>
			<h3 className="font-black text-2xl underline mb-3 md:no-underline md:mb-0">
				Works
			</h3>
			<div className="flex flex-col gap-2 w-full md:w-[82%]">
				{workContents.map((work, index) => {
					return (
						<div
							key={index}
							className={`flex text-background-10 md:max-h-36 shadow-2xl flex-col ${
								index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
							}`}
						>
							<div className="w-full md:w-[40%] min-h-[9rem] md:h-36 flex justify-center px-10 py-4 bg-background-10">
								<img
									src={work.logo}
									alt={work.heading}
									className="h-full max-h-36 object-contain"
								/>
							</div>
							<div className="flex flex-col justify-center items-center bg-primary-60 w-full py-16">
								<h4 className="font-semibold hover:underline underline-offset-2 text-xl md:text-2xl">
									<a
										href={work.link}
										target="_blank"
										rel="noreferrer"
										className="flex items-center gap-2"
									>
										<p>{work.heading}</p>
										<IconLink />
									</a>
								</h4>
								<p className="mt-2 font-semibold text-primary-10 text-md text-center">
									{work.desc}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</Container>
	);
};

export default Works;
