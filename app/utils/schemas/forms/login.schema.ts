import * as z from "zod";

export const loginEmailSchema = z.object({
  email: z.string().email(),
});

export const loginPhoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits long"),
});
