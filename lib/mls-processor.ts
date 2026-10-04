export interface RawPropertyInput {
  property_id?: string;
  street_address?: string;
  unit?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  zip_code?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  amenities?: string[];
  local_sponsors?: Array<{
    sponsor_id: string;
    business_name: string;
    category: "lender" | "insurance" | "title_escrow" | "general_contractor" | "moving";
    placement_tier: "primary" | "secondary";
    phone?: string;
  }>;
}

export interface NormalizedProperty {
  property_id: string;
  address: {
    street_address: string;
    unit?: string | null;
    city: string;
    state: string;
    postal_code: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  amenities: string[];
  zip_code: string;
  local_sponsors: Array<{
    sponsor_id: string;
    business_name: string;
    category: "lender" | "insurance" | "title_escrow" | "general_contractor" | "moving";
    placement_tier: "primary" | "secondary";
    phone?: string;
  }>;
}

// Baseline Austin market rates ($/sqft) by zip code for estimation
const ZIP_MARKET_RATES_PER_SQFT: Record<string, number> = {
  "78701": 850, // Downtown Austin
  "78702": 500, // East Austin
  "78703": 650, // Clarksville / Tarrytown
  "78704": 600, // South Congress / Zilker
  "78756": 425, // Rosedale / Brentwood
  "78757": 450, // Crestview / Justin Ln
  default: 420,
};

/**
 * Estimates the market rate for a property based on location and square footage.
 * Guaranteed to return a strictly positive integer (> 0).
 */
export function estimateMarketRate(input: {
  zip_code?: string;
  postal_code?: string;
  square_feet?: number;
  bedrooms?: number;
}): number {
  const zip = input.zip_code || input.postal_code || "default";
  const ratePerSqft = ZIP_MARKET_RATES_PER_SQFT[zip] || ZIP_MARKET_RATES_PER_SQFT.default;
  const sqft = Math.max(100, input.square_feet || 1000);
  const bedroomAdjustment = (input.bedrooms ?? 2) > 3 ? 1.08 : 1.0;
  
  const estimated = Math.round(sqft * ratePerSqft * bedroomAdjustment);
  return Math.max(1, estimated);
}

export interface IngestOptions {
  pricePolicy: "reject" | "estimate";
}

/**
 * Ingests and normalizes a property record.
 * RULE: "Reject or estimate market rate; never supply 0 or negative numbers."
 */
export function ingestPropertyRecord(
  raw: RawPropertyInput,
  options: IngestOptions = { pricePolicy: "estimate" }
): NormalizedProperty {
  const zip = raw.zip_code || raw.postal_code || "78701";
  
  // Validate non-negative / non-zero numbers
  const rawPrice = raw.price;
  let finalPrice: number;

  if (typeof rawPrice !== "number" || isNaN(rawPrice) || rawPrice <= 0) {
    if (options.pricePolicy === "reject") {
      throw new Error(
        `[MLS Ingest Error] Invalid price (${rawPrice}) for property '${raw.property_id || raw.street_address}'. ` +
        `Rule: Never supply 0 or negative numbers. Record rejected under policy='reject'.`
      );
    } else {
      // Estimate market rate
      finalPrice = estimateMarketRate({
        zip_code: zip,
        square_feet: raw.square_feet,
        bedrooms: raw.bedrooms,
      });
    }
  } else {
    finalPrice = Math.round(rawPrice);
  }

  // Ensure price is strictly positive integer
  if (finalPrice <= 0) {
    throw new Error(`[MLS Ingest Error] Price must be strictly positive (got ${finalPrice}).`);
  }

  const squareFeet = raw.square_feet ? Math.max(100, Math.round(raw.square_feet)) : 1000;
  const bedrooms = raw.bedrooms !== undefined ? Math.max(0, Math.round(raw.bedrooms)) : 2;
  const bathrooms = raw.bathrooms !== undefined ? Math.max(0.5, raw.bathrooms) : 1;

  return {
    property_id: raw.property_id || `prop_${Date.now()}`,
    address: {
      street_address: raw.street_address || "100 Main St",
      unit: raw.unit ?? null,
      city: raw.city || "Austin",
      state: raw.state || "TX",
      postal_code: zip,
    },
    price: finalPrice,
    bedrooms,
    bathrooms,
    square_feet: squareFeet,
    amenities: raw.amenities || [],
    zip_code: zip,
    local_sponsors: raw.local_sponsors || [],
  };
}
