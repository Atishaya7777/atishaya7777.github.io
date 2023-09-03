import React from 'react';

interface IButton {
	onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
	btnStyles?: Array<string>;
	children?: React.ReactNode;
}

const Button: React.FC<IButton> = ({ onClick, btnStyles, children }) => {
	return (
		<button
			className={`p-4  rounded-md cursor-pointer uppercase fluid-hover mr-3 font-bold border-2 border-primary-60 ${btnStyles?.join(
				' '
			)}`}
			onClick={onClick}
		>
			<div className="relative">{children}</div>
		</button>
	);
};

export default Button;
