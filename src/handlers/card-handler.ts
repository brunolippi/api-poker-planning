import { Server } from "socket.io";
import { ISocket, RoomManager } from "../rooms";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const cardEventHandler = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: ISocket,
  roomManager: RoomManager
) => {
  const pickCard = async (index: number) => {
    console.log("pick-card", index);
    await roomManager.selectCard(index);
    socket.to([socket.roomId, socket.id]).emit("refresh-cards");
    socket.emit("refresh-cards");
  };
  const flipCards = async () => {
    console.log("flip-cards");
    await roomManager.flipCards();
    socket.to([socket.roomId, socket.id]).emit("refresh-cards");
    socket.emit("refresh-cards");
  };
  const selectDeck = async (id: number) => {
    console.log("select-deck", id);
    await roomManager.selectDeck(id);
    socket.to([socket.roomId, socket.id]).emit("refresh-cards");
  };

  socket.on("pick-card", pickCard);
  socket.on("flip-cards", flipCards);
  socket.on("select-deck", selectDeck);
};
