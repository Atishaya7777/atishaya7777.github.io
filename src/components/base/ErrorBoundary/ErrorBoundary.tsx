/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ErrorInfo } from 'react';

interface IState {
	/** Flag to indicate if error captured or not */
	hasError: boolean;
}

class ErrorBoundary extends React.Component<any, IState> {
	constructor(props: object) {
		super(props);
		this.state = {
			hasError: false,
		};

		this.refreshPage = this.refreshPage.bind(this);
	}

	static getDerivedStateFromError(): IState {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		if (import.meta.env.DEV) {
			console.log({ error: error, errorInfo: info });
		}
	}

	refreshPage() {
		window.location.reload();
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					className="flex justify-center items-center h-[100vh] text-center"
					role="alert"
				>
					<div>
						<h2 className="text-6xl font-semibold mb-6">
							Something went wrong!
						</h2>
						<p className="text-2xl font-semibold my-4">
							Oops... Looks like there was an error. We are on it!
						</p>
						<div className="flex w-full justify-center">
							<button
								className="p-4  rounded-md cursor-pointer uppercase fluid-hover mr-3 font-bold border-2 border-primary-60 "
								onClick={this.refreshPage}
							>
								<p className="relative">Refresh the page</p>
							</button>
							<button
								className="p-4  rounded-md cursor-pointer uppercase fluid-hover mr-3 font-bold border-2 border-primary-60"
								onClick={() => window.history.back()}
							>
								<p className="relative">Go back</p>
							</button>
						</div>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
export default ErrorBoundary;
