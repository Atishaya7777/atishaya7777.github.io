import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';

const AppRouter = () => {
	return (
		// TODO: Replace this with a loading component
		<Suspense fallback={<div>Loading.....</div>}>
			<Router future={{ v7_startTransition: true }}>
				<Routes />
			</Router>
		</Suspense>
	);
};

export default AppRouter;
