export interface IDeckList {
  id: number;
  name: string;
  cards: string[] | number[];
}

export const deckList: IDeckList[] = [
  {
    id: 1,
    name: "Fibonacci",
    cards: [1, 2, 3, 5, 8, 13, 21, 52],
  },
  {
    id: 2,
    name: "Sprints",
    cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 3,
    name: "Classic",
    cards: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100],
  },
];
