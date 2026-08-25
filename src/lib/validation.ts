import { z } from "zod"

/** Ghana phone number regex matching 024XXXXXXX, 055XXXXXXX, +233... */
export const ghanaPhoneRegex = /^(\+233|0)[235][0-9]{8}$/

export const ghanaPhoneSchema = z.string().trim().refine((val) => ghanaPhoneRegex.test(val.replace(/\s+/g, "")), {
  message: "Enter a valid 10-digit Ghana phone number (e.g. 0241234567 or +233241234567).",
})

/** Password strength validation schema */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .refine((pw) => /[A-Z]/.test(pw) || /[a-z]/.test(pw), "Password must contain letters.")
  .refine((pw) => /[0-9]/.test(pw), "Password must contain at least one number.")
  .refine((pw) => /[^A-Za-z0-9]/.test(pw), "Password must contain at least one special character (!@#$%^&*).")

/** Service price validation schema */
export const bookingPriceSchema = z
  .number({ message: "Price must be a valid number." })
  .positive("Price must be greater than GH₵0.")
  .max(100000, "Price exceeds maximum threshold of GH₵100,000.")

/** Complaint submission Zod schema */
export const complaintInputSchema = z.object({
  category: z.enum(["BOOKING", "PROVIDER", "PAYMENT", "APP", "OTHER"]),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(120),
  message: z.string().trim().min(10, "Please describe your complaint in at least 10 characters.").max(2000),
  providerId: z.string().optional(),
  bookingId: z.string().optional(),
})
