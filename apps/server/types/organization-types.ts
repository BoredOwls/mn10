import { organizations } from "../db/schema";


export type Organization = typeof organizations.$inferSelect;
