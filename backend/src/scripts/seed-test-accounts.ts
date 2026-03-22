/**
 * One-time script: set the correct plan for each test account.
 * Run once on Railway via: npx tsx src/scripts/seed-test-accounts.ts
 * This file is safe to keep — it only updates specific emails.
 */
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const TEST_ACCOUNTS = [
  { email: "test.starter@workforceautomated.com", plan: "starter" as const },
  { email: "test.pro@workforceautomated.com", plan: "professional" as const },
  { email: "test.enterprise@workforceautomated.com", plan: "enterprise" as const },
];

async function run() {
  console.log("Seeding test account plans...");
  for (const acct of TEST_ACCOUNTS) {
    const [updated] = await db
      .update(users)
      .set({ plan: acct.plan })
      .where(eq(users.email, acct.email))
      .returning({ id: users.id, email: users.email, plan: users.plan });
    if (updated) {
      console.log(`  ✅ ${updated.email} → plan=${updated.plan} (id=${updated.id})`);
    } else {
      console.log(`  ⚠️  No user found for ${acct.email}`);
    }
  }
  console.log("Done.");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
