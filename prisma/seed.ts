import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BOOKS = [
  { category: "kids", title: "The Moonlit Treehouse", author: "Priya Nair", price: 8.99, pages: 32, condition: "Like New", description: "Two siblings discover a glowing treehouse that only appears at bedtime." },
  { category: "kids", title: "Bunny Bus to Rainbow Town", author: "Leo Hart", price: 7.5, pages: 28, condition: "Good", description: "A cheerful ride through colors, shapes, and new friends." },
  { category: "kids", title: "Counting Clouds", author: "Amira Cole", price: 6.99, pages: 24, condition: "Very Good", description: "Learn numbers 1 to 20 while floating across a soft sky." },
  { category: "kids", title: "Dinosaur Picnic Day", author: "Sam Ortega", price: 9.25, pages: 36, condition: "Like New", description: "Gentle T-Rex and friends pack sandwiches for a sunny meadow feast." },
  { category: "school", title: "Grade 8 Science Made Clear", author: "Dr. Helen Brooks", price: 14.99, pages: 210, condition: "Good", description: "Clear notes, diagrams, and practice questions for middle school science." },
  { category: "school", title: "Algebra Essentials Workbook", author: "Marcus Lin", price: 12.5, pages: 180, condition: "Very Good", description: "Step-by-step algebra drills with answer keys for self-study." },
  { category: "school", title: "World Geography Atlas for Students", author: "Nina Kapoor", price: 16.0, pages: 96, condition: "Like New", description: "Maps, climate zones, and continent overviews made for classrooms." },
  { category: "school", title: "English Grammar Practice Pack", author: "Owen Blake", price: 11.75, pages: 150, condition: "Good", description: "Parts of speech, punctuation, and writing exercises for school success." },
  { category: "history", title: "Empires Along the Silk Road", author: "Farah Rahman", price: 18.5, pages: 320, condition: "Very Good", description: "Trade routes, cities, and cultures connecting East and West." },
  { category: "history", title: "Voices of Independence", author: "James Okoro", price: 15.99, pages: 274, condition: "Good", description: "Letters and stories from freedom movements across continents." },
  { category: "history", title: "Ancient Cities Unearthed", author: "Clara West", price: 17.25, pages: 248, condition: "Like New", description: "Archaeology walks through lost capitals and buried streets." },
  { category: "history", title: "The Clockmakers of Vienna", author: "Erik Lang", price: 13.5, pages: 198, condition: "Good", description: "A craft history of precision, guilds, and city life in the 1800s." },
  { category: "nature", title: "Forest Quiet: A Field Companion", author: "Ivy Chen", price: 14.0, pages: 160, condition: "Like New", description: "Trees, birdsong, and seasonal notes for mindful woodland walks." },
  { category: "nature", title: "Ocean Currents Explained", author: "Mateo Ruiz", price: 16.75, pages: 220, condition: "Very Good", description: "How tides, reefs, and migrating sea life keep the planet breathing." },
  { category: "nature", title: "Wild Gardens of the Valley", author: "Rosa Delgado", price: 12.99, pages: 140, condition: "Good", description: "Native plants, pollinators, and backyard habitat tips." },
  { category: "nature", title: "Birds Before Sunrise", author: "Tom Ellis", price: 13.25, pages: 112, condition: "Very Good", description: "A gentle guide to dawn choruses and common songbirds." },
  { category: "adventure", title: "Ridge of the Copper Storm", author: "Kai Morgan", price: 15.5, pages: 310, condition: "Like New", description: "A mountain expedition turns into a race against a desert tempest." },
  { category: "adventure", title: "Map of the Hidden Harbor", author: "Selene Park", price: 14.25, pages: 286, condition: "Very Good", description: "Treasure hunters chase a coded chart across stormy seas." },
  { category: "adventure", title: "Night Train to Amber City", author: "Jonah Reed", price: 13.99, pages: 268, condition: "Good", description: "A young courier carries a sealed letter through enemy territories." },
  { category: "adventure", title: "Canyon Echoes", author: "Maya Stone", price: 12.5, pages: 240, condition: "Very Good", description: "Two climbers uncover a forgotten path beneath red cliffs." },
  { category: "mix", title: "Kitchen Stories & Spices", author: "Ananya Mehta", price: 11.5, pages: 190, condition: "Good", description: "Warm essays, recipes, and travel notes from home kitchens." },
  { category: "mix", title: "Puzzle Nights Anthology", author: "Various Authors", price: 10.99, pages: 205, condition: "Very Good", description: "Short mysteries, poems, and comics for rainy evenings." },
  { category: "mix", title: "How to Mend Almost Anything", author: "Greta Holm", price: 12.0, pages: 168, condition: "Like New", description: "Practical fixes for clothes, gadgets, and household odds." },
  { category: "mix", title: "Sunday Shelf Sampler", author: "House Collection", price: 9.75, pages: 150, condition: "Good", description: "A curated mix of essays, folklore, and feel-good fiction." },
];

async function main() {
  await prisma.rating.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("OwnerPass123!", 10);

  await prisma.user.create({
    data: {
      name: "Bhavani Prasad",
      email: "bhavaniprasad9848@gmail.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Stable IDs: reseeding must not change a book's ID, otherwise carts saved in
  // shoppers' browsers (localStorage) would point at books that no longer exist.
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  await prisma.book.createMany({
    data: BOOKS.map((book) => ({
      id: `${book.category}-${slugify(book.title)}`,
      title: book.title,
      author: book.author,
      priceCents: Math.round(book.price * 100),
      pages: book.pages,
      condition: book.condition,
      description: book.description,
      category: book.category,
      stock: 5,
    })),
  });

  console.log("Seeded admin owner + 24 books.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
