import { z } from "zod";

export const AddressSchema = z.object({
  street_address: z.string().min(3),
  unit: z.string().nullable(),
  city: z.string().min(2),
  state: z.string().regex(/^[A-Z]{2}$/, "Must be a 2-letter state code"),
  postal_code: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/, "Invalid postal code"),
}).strict();

export const AmenityEnum = z.enum([
  "central_ac",
  "forced_air_heating",
  "in_unit_laundry",
  "swimming_pool",
  "attached_garage",
  "fenced_yard",
  "hardwood_floors",
  "stainless_appliances",
  "solar_panels",
  "ev_charger",
]);

export const LocalSponsorSchema = z.object({
  sponsor_id: z.string().regex(/^spn_[a-zA-Z0-9_-]+$/),
  business_name: z.string().min(2),
  category: z.enum(["lender", "insurance", "title_escrow", "general_contractor", "moving"]),
  placement_tier: z.enum(["primary", "secondary"]),
  phone: z.string().regex(/^\+1[0-9]{10}$/).optional(),
}).strict();

export const PropertySchema = z.object({
  property_id: z.string().regex(/^prop_[a-zA-Z0-9_-]+$/),
  address: AddressSchema,
  price: z.number().int().positive("Number must be greater than 0"),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().min(0.5),
  square_feet: z.number().int().min(100),
  amenities: z.array(AmenityEnum),
  zip_code: z.string().regex(/^[0-9]{5}$/),
  local_sponsors: z.array(LocalSponsorSchema),
}).strict();

export type Property = z.infer<typeof PropertySchema>;
export type LocalSponsor = z.infer<typeof LocalSponsorSchema>;
export type Amenity = z.infer<typeof AmenityEnum>;
