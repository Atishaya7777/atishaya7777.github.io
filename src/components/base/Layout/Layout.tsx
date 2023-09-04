import { Footer, NavBar } from 'components';
import React from 'react';

interface ILayoutProps {
	children?: React.ReactNode;
}

const Layout: React.FC<ILayoutProps> = ({ children }) => {
	return (
		<>
			<NavBar />
			{children}
			<Footer />
		</>
	);
};

export default Layout;
