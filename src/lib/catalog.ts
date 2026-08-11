export const CATEGORIES = [
  {
    id: "kids",
    name: "Kids Books",
    blurb: "Picture books and early readers for little imaginations.",
    accent: "#e8a54b",
  },
  {
    id: "school",
    name: "School Books",
    blurb: "Study guides, textbooks, and exam prep for every grade.",
    accent: "#3d7ea6",
  },
  {
    id: "history",
    name: "History Books",
    blurb: "Past worlds, empires, and the people who shaped them.",
    accent: "#8b5e3c",
  },
  {
    id: "nature",
    name: "Nature Books",
    blurb: "Forests, oceans, wildlife, and the living planet.",
    accent: "#3f7d57",
  },
  {
    id: "adventure",
    name: "Adventure Books",
    blurb: "Quests, expeditions, and pulse-racing journeys.",
    accent: "#c45c26",
  },
  {
    id: "mix",
    name: "All Mix Books",
    blurb: "A house shelf grab-bag of favorites across every mood.",
    accent: "#5c4d7a",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryById(id: string) {
  return CATEGORIES.find((category) => category.id === id);
}

export function moneyFromCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calcShippingCents(subtotalCents: number) {
  return subtotalCents >= 4000 ? 0 : 350;
}
