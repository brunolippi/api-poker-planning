import { deckList, IDeckList } from "./decks";
import { Socket } from "socket.io";
import { Redis, RedisClient } from "./redis";
import crypto from "crypto";

interface IMember {
  id: string;
  name: string;
  card: number | string | null;
  hidden: boolean;
}

type MemberMap = {
  [key: string]: IMember;
};

export interface IRoom {
  id: string;
  members: MemberMap;
  availableDecks: IDeckList[];
  selectedDeck: number;
}

type RoomMap = {
  [key: string]: IRoom;
};

export interface ISocket extends Socket {
  member: IMember;
  roomId: string;
}

interface IRoomManager {
  createRoom(): Promise<IRoom>;
  joinRoom(roomId: string, socket: ISocket): Promise<IRoom>;
  removeFromRoom(reason: string): Promise<void>;
  /*   clearTableOnRoom(room: IRoom): void;
  changeDeck(newDeckIndex: number): void;
  flipAll(): void; */
}

export class RoomManager implements IRoomManager {
  socket: ISocket;
  redis: RedisClient;

  constructor(socket: ISocket) {
    this.socket = socket;
    this.redis = new Redis();
  }

  private async createRoomNumber(): Promise<string> {
    const roomNumber = crypto.randomInt(100000, 1000000);
    const existingRoom = await this.redis.get(`room-${roomNumber.toString()}`);
    if (existingRoom) {
      return this.createRoomNumber();
    }
    return roomNumber.toString();
  }

  async getRooms(): Promise<RoomMap> {
    return await this.redis.get<RoomMap>("rooms");
  }

  async getRoom(): Promise<IRoom> {
    const { roomId } = this.socket;
    return await this.redis.get<IRoom>(roomId);
  }

  async createRoom(): Promise<IRoom> {
    const roomNumber = await this.createRoomNumber();
    const roomName = `room-${roomNumber}`;

    const room = {
      id: roomName,
      members: {},
      availableDecks: deckList,
      selectedDeck: 0,
    };

    try {
      const newRoom = await this.updateRoom(roomName, room);
      console.log({ message: "Created new room", newRoom });
    } catch (err) {
      throw new Error(err as string);
    }

    return room;
  }

  private async updateRoom(roomId: string, room: IRoom) {
    await this.redis.set<IRoom>(roomId, room);

    const rooms = await this.redis.get<RoomMap>("rooms");
    const newRooms = {
      ...rooms,
      [roomId]: room,
    };

    await this.redis.set("rooms", newRooms);
    return room;
  }

  async joinRoom(roomId: string): Promise<IRoom> {
    try {
      const { id, member } = this.socket;
      const { members, ...room } = await this.redis.get<IRoom>(roomId);

      await this.socket.join(room.id);
      this.socket.roomId = room.id;

      const newRoomMember: IRoom = {
        ...room,
        members: {
          ...members,
          [id]: member,
        },
      };
      console.log(`New user: ${id} joined room ${room.id}`);
      return await this.updateRoom(roomId, newRoomMember);
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async deleteRoom(roomId: string) {
    try {
      await this.redis.del(roomId);
      const rooms = await this.redis.get<RoomMap>("rooms");
      delete rooms[roomId];
      await this.redis.set("rooms", rooms);
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async removeFromRoom(): Promise<void> {
    try {
      const { roomId, id } = this.socket;
      const { members, ...room } = await this.redis.get<IRoom>(roomId);
      if (members) delete members[id];
      const newRoom = {
        members,
        ...room,
      };
      await this.updateRoom(roomId, newRoom);
      console.log(`User ${id} left room ${room.id}`);
    } catch (err) {
      throw new Error(err as string);
    }
  }

  // Cards

  async getDecks(): Promise<IDeckList[]> {
    const { roomId } = this.socket;
    const { availableDecks } = await this.redis.get<IRoom>(roomId);

    return availableDecks;
  }

  async selectDeck(id: number): Promise<void> {
    const { roomId } = this.socket;
    const room = await this.redis.get<IRoom>(roomId);

    const newRoom = {
      ...room,
      selectedDeck: id,
    };

    await this.redis.set(roomId, newRoom);
  }

  async selectCard(index: number) {
    const { id, roomId } = this.socket;
    const { members, ...room } = await this.redis.get<IRoom>(roomId);

    members[id].card = index;

    const newRoom = {
      members,
      ...room,
    };
    await this.updateRoom(roomId, newRoom);
  }

  async flipCards(): Promise<void> {
    const { roomId } = this.socket;
    const { members, ...room } = await this.redis.get<IRoom>(roomId);

    const membersEntries = Object.entries(members);

    for (const [id, member] of membersEntries) {
      members[id].hidden = !members[id].hidden;
    }

    const newRoom = {
      ...room,
      members,
    };

    await this.redis.set(roomId, newRoom);
  }
}
