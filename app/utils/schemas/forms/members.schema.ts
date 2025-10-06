import * as z from "zod";

export const InviteSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100),
  role: z.enum(["admin", "editor", "viewer", "owner"]),
});

export type InviteSchemaType = z.output<typeof InviteSchema>;