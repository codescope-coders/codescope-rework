import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { admins, appSettings, branding } from "./schema";

// Credentials default to the initial admin but can be overridden via env,
// e.g. SEED_ADMIN_EMAIL=me@site.com SEED_ADMIN_PASSWORD=secret npm run db:seed
// Normalized to match the OTP service, which looks admins up by a trimmed +
// lowercased email — a mixed-case seed would otherwise never receive a code.
const email = (process.env.SEED_ADMIN_EMAIL ?? "amirtouma1998@gmail.com")
  .trim()
  .toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD ?? "123456789";
const name = process.env.SEED_ADMIN_NAME ?? "المدير";

async function seed() {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Idempotent: create the admin (role ADMIN), or reset password/name if it
  // already exists, so re-running the seed always leaves these credentials
  // working. Never downgrades an existing admin's role.
  const [admin] = await db
    .insert(admins)
    .values({ email, password: hashedPassword, name, role: "ADMIN", active: true })
    .onConflictDoUpdate({
      target: admins.email,
      set: { password: hashedPassword, name, updatedAt: sql`now()` },
    })
    .returning({ id: admins.id, email: admins.email });

  console.log(`✅ Seeded admin: ${admin.email} (id: ${admin.id})`);

  // Branding singleton (id = 1) — default Codescope identity.
  await db
    .insert(branding)
    .values({
      id: 1,
      name: "كودسكوب",
      tagline: "متابعة تورسكوب",
      logoText: "CS",
    })
    .onConflictDoNothing({ target: branding.id });
  console.log("✅ Seeded branding singleton");

  // Finance category lists singleton (id = 1) — defaults from the source app.
  await db
    .insert(appSettings)
    .values({
      id: 1,
      incomeCategories: ["دفعة عميل", "اشتراك شهري/سنوي", "أخرى"],
      expenseCategories: [
        "رواتب",
        "استضافة وسيرفرات",
        "تسويق وإعلانات",
        "أدوات وبرامج",
        "مصاريف مكتب",
        "توزيع أرباح",
        "أخرى",
      ],
      deductionReasons: ["تأخير", "طلب", "عدم أداء مهمة", "أخرى"],
    })
    .onConflictDoNothing({ target: appSettings.id });
  console.log("✅ Seeded finance settings singleton");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
