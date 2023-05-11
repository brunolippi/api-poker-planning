import express, { Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import { ISocket, RoomManager } from "./rooms";
import { router } from "./router";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { roomEventHandler } from "./handlers/room-handler";
import { cardEventHandler } from "./handlers/card-handler";
require("dotenv").config();

const app = express();
const server = createServer(app);
const API_PORT = process.env.PORT ?? 8080;
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

const onDisconnect = async function (
  socket: ISocket,
  roomManager: RoomManager
) {
  if (socket.roomId) {
    await roomManager.removeFromRoom();
    socket.to(socket.roomId).emit("refresh-rooms");
  }
  socket.emit("connected", {
    message: "client disconnected",
    roomId: socket.roomId,
    id: socket.id,
    connected: false,
  });
  console.log("user disconnected", socket.roomId);
};

const onConnection = (
  _socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  const socket = _socket as ISocket;

  socket.member = {
    id: socket.id,
    name: "",
    card: null,
    hidden: true,
  };
  const roomManager = new RoomManager(socket);

  socket.emit("connected", {
    message: "new client connected",
    roomId: socket.roomId,
    id: socket.id,
    connected: true,
  });

  socket.on("test", () => {
    console.log("test", socket.id);
    socket.emit("test", "hello");
  });

  // Event handlers
  roomEventHandler(io, socket, roomManager);
  cardEventHandler(io, socket, roomManager);

  socket.on("disconnect", async () => onDisconnect(socket, roomManager));
};

io.on("connection", onConnection);

app.use(express.static("dist"));

function serveHTML(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
}

app.get("/", serveHTML);
app.get("/r/*", serveHTML);

app.use(router);

server.listen(API_PORT, () => {
  console.log(`The application is listening on port ${API_PORT}!`);
});
