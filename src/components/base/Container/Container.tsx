import React from 'react';

interface IContainer {
	containerId: string;
	isBlack?: boolean;
	children?: React.ReactNode;
}

const Container: React.FC<IContainer> = ({
	containerId,
	isBlack = false,
	children,
}) => {
	return (
		<section
			id={containerId}
			className={`flex w-full justify-center py-20 ${
				isBlack ? 'bg-primary-60 text-background-10' : ''
			}`}
		>
			<div className="flex flex-col md:flex-row justify-between max-w-7xl w-full px-5">
				{children}
			</div>
		</section>
	);
};

export default Container;
