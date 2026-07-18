import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface SettingsDto {
  incomeCategories: string[];
  expenseCategories: string[];
  deductionReasons: string[];
}

const DEFAULT: SettingsDto = {
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
};

/** Finance category lists singleton (id = 1); created with defaults on first read. */
export const GetSettings = async () => {
  let row = await db.query.appSettings.findFirst({
    where: eq(appSettings.id, 1),
  });
  if (!row) {
    [row] = await db
      .insert(appSettings)
      .values({ id: 1, ...DEFAULT })
      .onConflictDoNothing({ target: appSettings.id })
      .returning();
    if (!row)
      row = await db.query.appSettings.findFirst({
        where: eq(appSettings.id, 1),
      });
  }
  const payload: SettingsDto = row
    ? {
        incomeCategories: row.incomeCategories,
        expenseCategories: row.expenseCategories,
        deductionReasons: row.deductionReasons,
      }
    : DEFAULT;
  return NextResponse.json({ message: "ok", payload });
};

export const UpdateSettings = async (data: Partial<SettingsDto>) => {
  const [row] = await db
    .insert(appSettings)
    .values({ id: 1, ...DEFAULT, ...data })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({
    message: "Settings updated.",
    payload: {
      incomeCategories: row.incomeCategories,
      expenseCategories: row.expenseCategories,
      deductionReasons: row.deductionReasons,
    },
  });
};
