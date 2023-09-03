import { ImgAboutMe } from 'assets';

const About = () => {
	const aboutMeContents: string[] = [
		"I'm a seasoned frontend developer specializing in React.js, known for crafting engaging and responsive web applications.",
		"I'm pursuing a Joint Honours degree in Computer Science and Mathematics, along with a Minor in Statistics from the University of Manitoba, bringing a strong educational foundation to my work.",
		'A diverse skill set in UI/UX, data management, and research in physics and mathematics, with a global perspective from Nepal.',
	];

	return (
		<section
			id="about"
			className="flex w-full justify-center bg-primary-60 text-background-10 py-20 "
		>
			<div className="flex flex-col md:flex-row justify-between max-w-7xl w-full px-5">
				<p className="font-black text-xl md:text-2xl">About Me</p>
				<div className="max-w-xl">
					{aboutMeContents.map((content, index) => (
						<p
							key={index}
							className={`font-bold tracking-wider ${
								index !== aboutMeContents.length - 1 ? 'mb-5' : 'mb-0'
							}`}
						>
							{content}
						</p>
					))}
				</div>
				<div className="mt-6 flex justify-center md:mt-0">
					<ImgAboutMe className="shadow-solid-drop-shadow" />
				</div>
			</div>
		</section>
	);
};

export default About;
