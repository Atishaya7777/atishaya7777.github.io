import { ImgHero } from 'assets';

const Hero = () => {
	return (
		<div className="flex w-full justify-center">
			<div className="flex flex-col md:flex-row items-center justify-between max-w-7xl relative px-2 md:px-0">
				<div className="flex flex-col text-center md:text-left w-full">
					<h5 className="font-bold md:font-semibold text-tertiary-50 text-xl md:text-2xl">
						Hi! I&apos;m Atishaya Maharjan. You can call me Atish!
					</h5>
					<h3 className="font-black text-4xl md:text-6xl mt-4 mb-8">
						A Frontend Developer
					</h3>
					<h5 className="font-bold md:font-semibold text-tertiary-50 text-xl md:text-2xl mb-8">
						Currently working for{' '}
						<span className="font-extrabold hover:underline">
							<a href="https://soanitech.com" target="_blank" rel="noreferrer">
								SoAni Tech
							</a>
						</span>
					</h5>
					<ul className="flex justify-center md:justify-start items-center font-bold text-xl text-primary-60 ">
						<li className="underline underline-offset-2 mr-6">
							<a href="#projects">Show projects</a>
						</li>
						<li className="underline underline-offset-2">
							<a href="#projects">Resume</a>
						</li>
					</ul>
					<div className="hidden md:flex absolute items-center font-bold rotate-[270deg] bottom-[10%] left-[-5%]">
						<div className="flex items-center w-20 h-1 rounded-xl bg-primary-30 mr-3">
							<div className="w-7 h-1 rounded-xl bg-primary-50 animate-move-vertical"></div>
						</div>
						<p>Scroll</p>
					</div>
				</div>
				<div className="w-[80%] mt-8 md:mt-0 md:w-[70%]">
					<ImgHero className="w-full h-fit motion-safe:animate-svg-stroke-draw hero-logo" />
				</div>
			</div>
		</div>
	);
};

export default Hero;
