import { io, Socket } from "socket.io-client";

// mereko yha singleton pattern use karna h
let socket:Socket | null = null;

export const getSocket = ()=>{
    if(!socket){
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
    }
    return socket;
}