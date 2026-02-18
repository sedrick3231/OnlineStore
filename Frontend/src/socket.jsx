import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL;

const socket = io(url, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  timeout: 20000,
});

socket.on("connect", () => {
});

socket.on("disconnect", (reason) => {
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});


export default socket;
