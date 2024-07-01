import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { TypeRaceInputProps, TypeRaceSockets } from '../../types';

interface InputProps {
	isOpen: boolean;
	isOver: boolean;
	gameId: string;
	socket: Socket;
}

const TypeRaceInput: React.FC<InputProps> = ({
	isOpen,
	isOver,
	gameId,
	socket,
}) => {
	const [input, setInput] = useState<string>('');
	const textInput = useRef<any>(null);

	useEffect(() => {
		if (!isOpen) {
			textInput.current.focus();
		}
	}, [isOpen]);

	const resetForm = () => {
		setInput('');
	};

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		let lastChar = value.charAt(value.length - 1);
		if (lastChar === ' ') {
			const payload: TypeRaceInputProps = {
				input,
				gameId,
			};
			socket.emit<TypeRaceSockets>('user-input', payload);
			resetForm();
		} else {
			setInput(e.target.value);
		}
	};

	return (
		<div className="w-[350px] md:w-[750px]">
			<input
				className={`input read-only:rounded-md mt-5 w-full ${
					isOpen || isOver ? 'cursor-not-allowed' : 'cursor-auto'
				}`}
				placeholder="Enter Words"
				ref={textInput}
				value={input}
				onChange={handleOnChange}
				readOnly={isOpen || isOver}
				spellCheck={false}
			/>
		</div>
	);
};

export default TypeRaceInput;
