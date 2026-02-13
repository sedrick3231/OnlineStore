import { io } from "socket.io-client";
const url = import.meta.env.VITE_BACKEND_URL;


const socket = io(`${url}` ,{
    withCredentials: true,
  transports: ["websocket"],
});

export default socket;
