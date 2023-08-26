import { Layout } from 'components';
import { About, Contact, Home, Work } from 'containers/pages';

import { Outlet, useRoutes } from 'react-router-dom';
import { routePaths } from 'global';

const Routes = () => {
	return useRoutes([
		{
			path: routePaths.home,
			element: (
				<Layout>
					<Outlet />
				</Layout>
			),
			children: [
				{
					path: routePaths.home,
					element: <Home />,
				},
				{
					path: routePaths.about,
					element: <About />,
				},
				{
					path: routePaths.contact,
					element: <Contact />,
				},
				{
					path: routePaths.work,
					element: <Work />,
				},
				// TODO: Replace this with an error template
				{
					path: '*',
					element: <div>Error 404 not found</div>,
				},
			],
		},
	]);
};

export default Routes;
