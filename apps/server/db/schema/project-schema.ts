import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const projects = pgTable("projects", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
