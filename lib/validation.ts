import { z } from "zod";
const clean = (v: string) => v.replace(/<[^>]*>/g, "").trim();
export const scanSchema = z.object({
  listingUrl: z.string().url().optional().or(z.literal("")),
  listingText: z
    .string()
    .max(20000)
    .optional()
    .transform((v) => (v ? clean(v) : v)),
  address: z.string().min(5).max(300).transform(clean),
  zip: z
    .string()
    .regex(/^\d{5}(?:-\d{4})?$/)
    .optional()
    .or(z.literal("")),
  bedrooms: z.coerce.number().min(0).max(20).optional(),
  bathrooms: z.coerce.number().min(0).max(20).optional(),
  advertisedRent: z.coerce.number().positive().max(100000),
  landlordName: z
    .string()
    .max(150)
    .optional()
    .transform((v) => (v ? clean(v) : v)),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  company: z
    .string()
    .max(150)
    .optional()
    .transform((v) => (v ? clean(v) : v)),
  conversation: z
    .string()
    .max(30000)
    .optional()
    .transform((v) => (v ? clean(v) : v)),
  saveReport: z.boolean().optional(),
});
export const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(10).max(128),
  name: z.string().min(2).max(100).optional(),
});
export type ValidScanInput = z.infer<typeof scanSchema>;
