import React from 'react';
import { routePaths } from 'global';
import { IconGithub, IconLinkedIn } from 'assets';

const Footer = () => {
	interface IFooterLinks {
		path: string;
		label: string;
		onClick?: () => void;
	}

	const footerContent: IFooterLinks[] = [
		{
			path: '#' + routePaths.home,
			label: 'Home',
			onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
		},
		{ path: '#' + routePaths.about, label: 'About Me', onClick: undefined },
		{ path: '#' + routePaths.work, label: 'Works', onClick: undefined },
	];

	interface ISocialMediaLinks {
		path: string;
		icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	}

	const socialMediaContent: ISocialMediaLinks[] = [
		{
			path: 'https://github.com/Atishaya7777',
			icon: IconGithub,
		},
		{
			path: 'www.linkedin.com/in/atishaya-maharjan07',
			icon: IconLinkedIn,
		},
	];

	return (
		<>
			<footer
				id={routePaths.contact}
				className="flex flex-col w-full items-center py-20 bg-primary-60 text-background-10"
			>
				<div className="flex flex-col max-w-7xl w-full px-5 gap-20">
					<div className="flex flex-col items-start md:flex-row md:items-center justify-between ">
						<h3 className="font-black text-2xl underline mb-3 md:no-underline md:mb-0">
							Contact Me
						</h3>
						<div className="w-full md:w-[82%]">
							<a
								href="mailto:atishaya@soanitech.com"
								className="text-2xl md:text-8xl"
							>
								atishaya@soanitech.com
							</a>
						</div>
					</div>
					<div className="flex flex-col md:flex-row justify-between">
						<ul className="flex flex-col md:flex-row gap-4 md:gap-6 text-lg">
							{footerContent.map((footerItem, index: number) => {
								return (
									<li
										key={index}
										className="font-semibold cursor-pointer hover:underline underline-offset-4"
										onClick={footerItem?.onClick}
									>
										<a href={footerItem.path} className="relative">
											{footerItem.label}
										</a>
									</li>
								);
							})}
						</ul>
						<h4 className="mt-8 mb-4 underline underline-offset-2 font-bold text-xl md:hidden">
							Socials:
						</h4>
						<ul className="flex gap-8">
							{socialMediaContent.map((socialMedia, index: number) => {
								return (
									<li key={index} className="font-semibold cursor-pointer">
										<a href={socialMedia.path} className="relative">
											{<socialMedia.icon />}
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</footer>
			<div className="w-full h-fit bg-background-10 text-center text-primary-60 font-extrabold">
				&copy;2023 Atishaya Maharjan
			</div>
		</>
	);
};

export default Footer;
