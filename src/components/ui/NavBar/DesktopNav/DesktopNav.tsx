import { navContents } from '../shared';
import { NavLink } from 'react-router-dom';

const DesktopNav = () => {
	return (
		<div className="hidden sm:flex w-full justify-between">
			{navContents.map((navItem, index: number) => {
				return (
					<NavLink key={index} to={navItem.path}>
						{navItem.label}
					</NavLink>
				);
			})}
		</div>
	);
};

export default DesktopNav;
