import { NavBar } from 'components';
import React from 'react';

interface ILayoutProps {
	children?: React.ReactNode;
}

const Layout: React.FC<ILayoutProps> = ({ children }) => {
	return (
		<div>
			<NavBar />
			{children}
		</div>
	);
};

export default Layout;
