import { Server } from "socket.io";
import { ISocket, RoomManager } from "../rooms";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const roomEventHandler = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: ISocket,
  roomManager: RoomManager
) => {
  const createRoom = async () => {
    console.log("create-room");
    const room = await roomManager.createRoom();
    socket.emit("new-room", room);
    socket.emit("refresh-rooms");
  };

  const getRooms = async () => {
    console.log("get-rooms");
    const rooms = await roomManager.getRooms();
    socket.emit("all-rooms", rooms);
  };

  const getRoom = async () => {
    console.log("get-room");
    const room = await roomManager.getRoom();
    socket.emit("get-room", room);
  };

  const joinRoom = async (roomId: string) => {
    console.log("join-room", roomId);
    const room = await roomManager.joinRoom(roomId);
    socket.to([roomId, socket.id]).emit("refresh-rooms");
    socket.emit("selected-room", room);
  };

  const deleteRoom = async (roomId: string) => {
    console.log("delete-room", roomId);
    await roomManager.deleteRoom(roomId);
    socket.emit("refresh-rooms");
  };

  socket.on("create-room", createRoom);
  socket.on("get-rooms", getRooms);
  socket.on("get-room", getRoom);
  socket.on("join-room", joinRoom);
  socket.on("delete-room", deleteRoom);
};
