import * as z from "zod";

export const InviteSchema = z.object({
  email: z.email(),
  // name: z.string().min(2).max(100),
  role: z.enum(["admin", "editor", "viewer", "member", "owner"]),
});

export const MemberSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100),
  role: z.enum(["admin", "editor", "viewer", "owner"]),
});

export type MemberSchemaType = z.output<typeof MemberSchema>;
export type InviteSchemaType = z.output<typeof InviteSchema>;