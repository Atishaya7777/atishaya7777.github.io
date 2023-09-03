import { AppRouter } from 'containers/routes';
import { ErrorBoundary } from 'components';

export default function App() {
	return (
		<ErrorBoundary>
			<main data-testid="app">
				<AppRouter />
			</main>
		</ErrorBoundary>
	);
}
