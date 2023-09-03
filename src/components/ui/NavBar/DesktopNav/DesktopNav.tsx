import { navContents } from '../shared';
import { NavLink } from 'react-router-dom';
import { routePaths } from 'global';

const DesktopNav = () => {
	return (
		<nav className="hidden sm:flex w-full justify-center bg-background-10 py-5">
			<div className="flex w-full items-center justify-between max-w-7xl text-xl px-5">
				<NavLink to={routePaths.home} className="font-extrabold ">
					{navContents[0].label}
				</NavLink>
				<ul className="flex">
					{navContents.slice(1).map((navItem, index: number) => {
						return (
							<li
								key={index}
								className="p-4 font-medium rounded-md cursor-pointer relative fluid-hover ml-3 hover:font-bold"
							>
								<a href={navItem.path} className="relative">
									{navItem.label}
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
};

export default DesktopNav;
