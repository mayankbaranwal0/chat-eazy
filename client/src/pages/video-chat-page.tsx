import { Button } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { Spinner } from '@chakra-ui/spinner';
import { useToast } from '@chakra-ui/toast';
import { Tooltip } from '@chakra-ui/tooltip';
import { FC, useEffect, useRef, useState } from 'react';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { Socket } from 'socket.io-client';
import { ChatState } from '../context/chat-provider';
import SlideDrawer from '../miscellaneous/Drawer';
import { VideoCallUser, VideoSockets } from '../types';
import { copyToClipBoard } from '../util';
import Peer from 'simple-peer';

interface IVideo {
	socket: Socket;
}

const VideoChatPage: FC<IVideo> = ({ socket }): JSX.Element => {
	const { user: loggedInUser } = ChatState();
	const toast = useToast();
	const myVideo = useRef<HTMLVideoElement | null>(null);
	const userVideo = useRef<HTMLVideoElement | null>(null);
	const connectionRef = useRef<any>();

	const [name, setName] = useState<string>('');
	const [callerName, setCallerName] = useState<string>('');
	const [idToCall, setIdtoCall] = useState<string>('');
	const [stream, setStream] = useState<any>();
	const [callAccepted, setCallAccepted] = useState<boolean>(false);
	const [camLoading, setCamLoading] = useState<boolean>(false);
	const [receivingCall, setReceivingCall] = useState<boolean>(false);
	const [me, setMe] = useState<string>('');
	const [callEnded, setCallEnded] = useState<boolean>(false);
	const [copied, setCopied] = useState<boolean>(false);
	const [caller, setCaller] = useState<string>('');
	const [callerSignal, setCallerSignal] = useState<any>();

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((stream) => {
				setStream(stream);
			});
	}, []);

	useEffect(() => {
		if (myVideo.current) {
			myVideo.current.srcObject = stream;
			setCamLoading(false);
		} else {
			setCamLoading(true);
		}

		socket.on<VideoSockets>('me', (id) => {
			console.log('id', id);
			setMe(id);
		});

		socket.on<VideoSockets>('callUser', (data: VideoCallUser) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
		});
	}, [socket, stream, receivingCall]);

	const HanldeCopy = () => {
		if (me) {
			setCopied(true);
			copyToClipBoard(me);
			toast({
				title: 'Copied to clipboard!',
				status: 'info',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
			setTimeout(() => {
				setCopied(false);
			}, 1200);
		} else {
			return;
		}
	};

	const CallUser = (id: string) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.emit<VideoSockets>('callUser', {
				userToCall: id,
				signalData: data,
				from: me,
				name: callerName,
			});
		});
		peer.on('stream', (stream) => {
			if (userVideo.current) {
				userVideo.current.srcObject = stream;
			}
		});
		socket.on<VideoSockets>('callAccepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});
		connectionRef.current = peer;
	};

	const AnswerCall = () => {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.emit<VideoSockets>('answerCall', { signal: data, to: caller });
		});
		peer.on('stream', (stream) => {
			if (userVideo.current) {
				userVideo.current.srcObject = stream;
			}
		});

		peer.signal(callerSignal);
		connectionRef.current = peer;
	};

	const LeaveCall = () => {
		setCallEnded(true);
		setCallAccepted(false);
		setIdtoCall('');
		connectionRef.current.destroy();
	};

	return (
		<>
			{loggedInUser && <SlideDrawer />}
			<div className="mainWrapper mx-3">
				<h1 className="font-semibold text-2xl ">Video Chat</h1>

				<section className="flex flex-col lg:flex-row items-start gap-4 mt-3">
					{/* Videos */}
					<div className="flex items-center gap-4 border p-4 rounded-md shadow-md h-auto lg:h-[268px]">
						{camLoading && (
							<Spinner
								size="xl"
								w={19}
								h={19}
								alignSelf="center"
								margin="auto"
							/>
						)}
						<div className="relative">
							<div className="callerInfo">{callerName || 'You'}</div>
							{stream && (
								<video
									playsInline
									muted
									ref={myVideo}
									autoPlay
									className="video"
								/>
							)}
						</div>

						{callAccepted && !callEnded ? (
							<div className="relative">
								<div className="callerInfo">{name || 'Caller'}</div>
								<video
									playsInline
									ref={userVideo}
									autoPlay
									className="video"
								/>
							</div>
						) : null}
					</div>

					{/* Join Info */}
					<div className="w-full lg:w-auto shadow-md p-5 rounded-md border border-gray-200 h-auto lg:h-[268px]">
						{/* Name Input */}
						<div className="flex items-center">
							<Input
								placeholder="Enter your Name"
								color="gray.800"
								borderColor="gray"
								roundedRight={0}
								spellCheck={false}
								value={callerName}
								onChange={(e) => setCallerName(e.target.value)}
								_hover={{
									border: '1px solid teal',
								}}
								_focus={{
									outline: 'none',
									ring: 'none',
									border: '1px solid teal',
								}}
							/>
							<Tooltip
								label="Copy your ID to send to your Friend"
								hasArrow
								placement="bottom-end"
							>
								<Button
									variant="solid"
									background={callerName && me ? 'teal.600' : 'gray.600'}
									color="white"
									disabled={!callerName && !me}
									pointerEvents={!callerName && !me ? 'none' : 'auto'}
									onClick={HanldeCopy}
									borderLeftRadius={0}
									_hover={{
										backgroundColor: callerName && me ? 'teal' : '#4A5567',
									}}
								>
									{copied ? 'Copied' : 'Copy ID'}
								</Button>
							</Tooltip>
						</div>

						{/* ID Input */}
						<div className="mt-5">
							<label className="font-bold">Enter ID to call</label>
							<Input
								placeholder="Enter ID"
								color="gray.800"
								borderColor="gray"
								spellCheck={false}
								value={idToCall}
								onChange={(e) => setIdtoCall(e.target.value)}
								_hover={{
									border: '1px solid teal',
								}}
								_focus={{
									outline: 'none',
									ring: 'none',
									border: '1px solid teal',
								}}
							/>
						</div>

						{/* Ansnwer / End Call */}
						<div className="mt-5">
							{callAccepted && !callEnded ? (
								<Tooltip
									label="End Call"
									hasArrow
									placement="bottom-end"
								>
									<Button
										onClick={LeaveCall}
										variant="solid"
										color="white"
										background="red.600"
										_hover={{
											backgroundColor: 'red',
										}}
									>
										End Call
									</Button>
								</Tooltip>
							) : (
								<Tooltip
									label="Send Call to this ID"
									hasArrow
									placement="bottom-end"
								>
									<Button
										onClick={() => CallUser(idToCall)}
										variant="solid"
										color="white"
										background={
											idToCall && callerName ? 'teal.600' : 'gray.600'
										}
										disabled={!idToCall && !callerName}
										pointerEvents={!idToCall && !callerName ? 'none' : 'auto'}
										_hover={{
											backgroundColor:
												idToCall && callerName ? 'teal' : '#4A5567',
										}}
										className="flex items-center gap-2"
									>
										<BsFillTelephoneFill /> {idToCall}
									</Button>
								</Tooltip>
							)}
						</div>

						{receivingCall && !callAccepted ? (
							<div className="mt-4">
								<h1 className="animate-pulse font-bold text-slate-700">
									{name} is calling...
								</h1>

								<Button
									variant="solid"
									color="white"
									background="telegram.600"
									_hover={{
										backgroundColor: '#005885',
									}}
									onClick={AnswerCall}
								>
									Answer
								</Button>
							</div>
						) : null}
					</div>
				</section>
			</div>
		</>
	);
};

export default VideoChatPage;
