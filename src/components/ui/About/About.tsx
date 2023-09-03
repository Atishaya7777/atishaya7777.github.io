import { ImgAboutMe } from 'assets';
import { Container } from 'components';
import { routePaths } from 'global';

const About = () => {
	const aboutMeContents: string[] = [
		"I'm a seasoned frontend developer specializing in React.js, known for crafting engaging and responsive web applications.",
		"I'm pursuing a Joint Honours degree in Computer Science and Mathematics, along with a Minor in Statistics from the University of Manitoba, bringing a strong educational foundation to my work.",
		'A diverse skill set in UI/UX, data management, and research in physics and mathematics, with a global perspective from Nepal.',
	];

	return (
		<Container containerId={routePaths.about} isBlack>
			<h3 className="font-black text-2xl underline mb-3 md:no-underline md:mb-0">
				About Me
			</h3>
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
		</Container>
	);
};

export default About;
