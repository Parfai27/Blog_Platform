import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../model/user.model";

dotenv.config();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

// Usage: npm run create-admin -- admin@example.com "the password" [First] [Last]
// Creates an admin account, or makes an existing account an admin and sets its password.
// No photo is needed; the account shows initials until one is added in Profile settings.
const main = async () => {
  const [rawEmail = "", password = "", firstName = "Site", lastName = "Admin"] = process.argv.slice(2);
  const email = rawEmail.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email) || !password) {
    console.error('Usage: npm run create-admin -- admin@example.com "the password" [First] [Last]');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error("Set MONGO_URI in .env first.");
    process.exit(1);
  }
  if (password.length < PASSWORD_MIN) {
    console.warn(
      `Warning: this password is shorter than the ${PASSWORD_MIN} characters the site requires elsewhere. ` +
        "It will work for logging in, but change it in a place anyone else can reach.",
    );
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email }).select("+password");

  if (existing) {
    existing.role = "admin";
    existing.isBlocked = false;
    existing.password = hashed;
    await existing.save();
    console.log(`${existing.firstName} ${existing.lastName} (${email}) is now an admin, with the new password.`);
  } else {
    await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: "admin",
      avatar: { url: "/logo.svg", publicId: "local:logo" },
    });
    console.log(`Created the admin account ${email}.`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
