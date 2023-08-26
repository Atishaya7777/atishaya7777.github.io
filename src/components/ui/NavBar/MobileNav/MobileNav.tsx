import { navContents } from '../shared';
import { NavLink } from 'react-router-dom';

const MobileNav = () => {
	return (
		<div className="block sm:hidden">
			{navContents.map((navItem, index: number) => {
				return (
					<div key={index}>
						<NavLink to={navItem.path}>{navItem.label}</NavLink>
					</div>
				);
			})}
		</div>
	);
};

export default MobileNav;
