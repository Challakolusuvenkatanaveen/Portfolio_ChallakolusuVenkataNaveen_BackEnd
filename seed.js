const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const SUPER_ADMIN_EMAIL = "superadmin@portfolio.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@123";

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log("Super admin already exists. Skipping seed.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  await User.create({
    fullName: "Super Admin",
    email: SUPER_ADMIN_EMAIL,
    password: hashedPassword,
    role: "super_admin",
    status: "active",
    permissions: [],
  });

  console.log("Super admin created:");
  console.log(`  Email: ${SUPER_ADMIN_EMAIL}`);
  console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
