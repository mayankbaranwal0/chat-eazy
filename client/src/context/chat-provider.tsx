import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatProps, InitialContextProps, UserProps } from '../types';

interface Props {
	children: React.ReactNode;
}

const ChatContext = createContext<InitialContextProps | null>(null);

export const ChatProvider = ({ children }: Props) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<UserProps | any>();
	const [selectedChat, setSelectedChat] = useState<ChatProps | any>();
	const [chats, setChats] = useState<ChatProps[]>([]);
	const [notification, setNotification] = useState<any[]>([]);

	useEffect(() => {
		const userInfo: UserProps = JSON.parse(localStorage.getItem('userInfo')!);
		setUser(userInfo);

		if (!userInfo) {
			navigate('/');
		}
	}, [navigate]);

	return (
		<ChatContext.Provider
			value={{
				user,
				setUser,
				selectedChat,
				setSelectedChat,
				chats,
				setChats,
				notification,
				setNotification,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

/**
 * Chat State
 * @returns { InitialContextProps }
 */
export const ChatState = (): InitialContextProps => {
	return useContext(ChatContext) as InitialContextProps;
};
