# Poker Planning API

> This API is a Poker Planning server to be consumed with Socket.io events, allowing you to connect multiple clients and keep record of the rooms stored in Redis.

#### Table of Contents  
- [Environment Variables](#environment-variables)  
- [Tech stack](#tech-stack)  
- [Events](#events) 
    - [Cards](#cards)
    - [Rooms](#rooms)
    - [Server](#server)
- [Types](#types)  

## Environment Variables

 To run this project, you will need to add the following environment variables to your .env file.

`PORT` API port.

`REDIS_DB` Database url including protocol.

## Tech stack

- TypeScript
- Node.js / Express
- Socket.io
- Redis


## Events

Events sent by the client are divided into two categories: **Rooms** and **Cards**.
The only events emitted by the server (excluding callbacks) are `refresh-cards` and `refresh-rooms`.

### Cards

|    Event    | Params |    Callback     | Description                    |
| :---------: | :----: | :-------------: | :----------------------------- |
|  pick-card  | index  | `refresh-cards` | Picks user's desired card.     |
| flip-cards  |   X    | `refresh-cards` | Flips all cards in session.    |
| select-deck |   id   | `refresh-cards` | Select a deck for the session. |

> 'refresh-cards' events are transmitted to the whole session.

### Rooms

|    Event    | Params |       Callback        | Description                         |
| :---------: | :----: | :-------------------: | :---------------------------------- |
| create-room |   X    |   `new-room` - [IRoom](#iroom)   | Create a new room.                  |
|  get-rooms  |   X    | `all-rooms` - [RoomMap](#roommap)  | Get all available rooms.            |
|  get-room   |   X    |   `get-room` - [IRoom](#iroom)    | Get information on a specific room. |
|  join-room  | roomId | `selected-room` - [IRoom](#iroom)  | Joins user to specific room.        |
| delete-room | roomId |           X           | Deletes the room.                   |

### Server

|     Event     | Scope  | Client behaviour                            |
| :-----------: | :----: | :------------------------------------------ |
| refresh-cards |  Room  | Call `get-room`, update the room and cards. |
| refresh-rooms | Global | Call `get-rooms` and update the rooms.      |

## Types

### RoomMap
```
{
  [id: string]: IRoom;
}
```

### IRoom
```
{
  id: string;
  members: MemberMap;
  availableDecks: IDeckList[];
  selectedDeck: number;
}
```

### IDeckList
```
{
  id: number;
  name: string;
  cards: string[] | number[];
}
```

### MemberMap
```
{
  [id: string]: IMember;
}
```

### IMember
```
{
  id: string;
  name: string;
  card: number | string | null;
  hidden: boolean;
}
```
