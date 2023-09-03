import { AppRouter } from 'containers/routes';
import { ErrorBoundary } from 'components';

export default function App() {
	return (
		<ErrorBoundary>
			<main data-testid="app" className="scroll-smooth">
				<AppRouter />
			</main>
		</ErrorBoundary>
	);
}
