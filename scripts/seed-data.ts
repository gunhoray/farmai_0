import { db } from "../app/lib/db";
import { consultants, farms, consultingSessions } from "../app/lib/schema";

async function seedData() {
  try {
    console.log("🌱 Seeding database...");

    // Add test consultant
    const [consultant] = await db.insert(consultants).values({
      email: "consultant@farmai.com",
      pwd: "password123",
      full_name: "Dr. Lee Seung-ho",
      phone: "010-1234-5678",
    }).returning();

    console.log("✅ Added consultant:", consultant.full_name);

    // Add test farms
    const [farm1] = await db.insert(farms).values({
      name: "Green Valley Farm",
      location: "Seoul, South Korea",
      owner_name: "Kim Min-su",
      size: 1500,
      crop: "Tomatoes",
    }).returning();

    const [farm2] = await db.insert(farms).values({
      name: "Sunshine Farm",
      location: "Busan, South Korea",
      owner_name: "Park Ji-eun",
      size: 800,
      crop: "Strawberries",
    }).returning();

    console.log("✅ Added farms:", farm1.name, "and", farm2.name);

    // Add test consulting session
    const [session] = await db.insert(consultingSessions).values({
      farm_id: farm1.farm_id,
      consultant_id: consultant.consultant_id,
      visit_date: new Date(),
      status: "diagnosis",
    }).returning();

    console.log("✅ Added consulting session");

    console.log("🎉 Database seeded successfully!");
    console.log("Farm IDs:", farm1.farm_id, farm2.farm_id);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedData(); 