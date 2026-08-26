import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const organizations = pgTable("orgs", {
	id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
