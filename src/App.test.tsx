import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import App from './App';

test('renders the app', () => {
	const { getByTestId } = render(<App />);

	const appElement = getByTestId('app');

	expect(appElement).toBeInTheDocument();
});
