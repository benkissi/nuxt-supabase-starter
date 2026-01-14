import * as z from "zod";

export const InviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
  role: z.enum(["admin", "editor", "viewer", "member", "owner"]),
});

export const MemberSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100),
  role: z.enum(["admin", "editor", "viewer", "owner"]),
  job_title: z.string().max(100).optional(),
});

export type MemberSchemaType = z.output<typeof MemberSchema>;
export type InviteSchemaType = z.output<typeof InviteSchema>;