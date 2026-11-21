import { z } from "zod";

// Attendee details collected at checkout; stored on the Razorpay order notes.
export const Attendee = z.object({
  tierId: z.enum(["student", "individual", "corporate", "workshop", "vip"]),
  fullName: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().regex(/^\+?[0-9 -]{8,16}$/),
  organization: z.string().trim().max(120).optional().default(""),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL", "2XL", "3XL"]),
  dietaryPreference: z.enum(["vegetarian", "non-vegetarian", "vegan", "jain", "no-preference"]),
});
