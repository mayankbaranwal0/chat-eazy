import { Button, FormControl, Input, Stack, useToast } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import { addUser } from '../../store/actions/tic-actions';
import { useAppDispatch } from '../../store/hook';
import { TicRoomTypesProps } from '../../types';
import { CreateRoomSVG, JoinRoomSVG } from '../illustrations';
import { IoArrowBackOutline } from 'react-icons/io5';
import CreateModal from './create-modal';
import JoinModal from './join-modal';
import { Socket } from 'socket.io-client';
import { ChatState } from '../../context/chat-provider';

const roomTypebtns: TicRoomTypesProps = [
	{
		type: 'create',
		text: 'Create Room',
	},
	{
		type: 'join',
		text: 'Join Room',
	},
];

interface TicTacFormProps {
	socket: Socket;
}

const TicTacForm: React.FC<TicTacFormProps> = ({ socket }) => {
	const { user } = ChatState();
	const userId: string = nanoid(5);
	const toast = useToast();
	const dispatch = useAppDispatch();
	const [userName, setUserName] = useState<string>(user.name);
	const [show, setShow] = useState<boolean>(false);
	const [activeBtn, setActiveBtn] = useState('');
	const [createModal, setCreateModal] = useState<boolean>(false);
	const [joinModal, setJoinModal] = useState<boolean>(false);

	function HandleClick() {
		if (userName === '') {
			toast({
				title: 'Please Enter User Name!',
				status: 'warning',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
			return;
		}
		dispatch(addUser(userName, userId));
		setShow(true);
	}

	return (
		<>
			{!show ? (
				<FormControl
					mt={4}
					display="flex"
					alignItems="center"
				>
					<Input
						placeholder="Enter your Name"
						width={200}
						color="gray.800"
						borderColor="gray"
						roundedRight={0}
						spellCheck={false}
						value={userName}
						onChange={(e) => setUserName(e.target.value)}
						_hover={{
							border: '1px solid teal',
						}}
						_focus={{
							outline: 'none',
							ring: 'none',
							border: '1px solid teal',
						}}
					/>
					<Button
						variant="solid"
						background={'teal.600'}
						color="white"
						ml={1}
						borderLeftRadius={0}
						onClick={HandleClick}
						_hover={{
							backgroundColor: 'teal',
						}}
					>
						Start Game
					</Button>
				</FormControl>
			) : null}

			{show ? (
				<Stack my={4}>
					<button
						className="bg-slate-600 text-white rounded-md px-3 py-2 text-base hover:bg-slate-500 w-[40px]"
						onClick={() => setShow(false)}
					>
						<IoArrowBackOutline size={17} />
					</button>
					<div className="flex flex-col md:flex-row items-center gap-2 cursor-pointer">
						{roomTypebtns.map((type, idx) => (
							<div
								key={idx}
								onClick={() => {
									setActiveBtn(type.type);
									type.type === 'create'
										? setCreateModal(true)
										: setJoinModal(true);
								}}
							>
								<div
									className={`ticBtns group ${
										activeBtn === type.type && 'bg-slate-600 text-white'
									}`}
								>
									{type.type === 'create' ? <CreateRoomSVG /> : <JoinRoomSVG />}
									<h3 className="font-[700] text-xl group-hover:text-white">
										{type.text}
									</h3>
								</div>
							</div>
						))}
					</div>
				</Stack>
			) : null}

			<CreateModal
				createModal={createModal}
				setCreateModal={setCreateModal}
				socket={socket}
			/>
			<JoinModal
				joinModal={joinModal}
				setJoinModal={setJoinModal}
				socket={socket}
			/>
		</>
	);
};

export default TicTacForm;
