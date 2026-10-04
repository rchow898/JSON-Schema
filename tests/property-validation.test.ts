import { describe, it, expect } from "vitest";
import { PropertySchema } from "../src/schemas/property";
import rawData from "../data/generated/raw_properties.json";

describe("Property Ingestion Validation Contract", () => {
  const validRecord = {
    property_id: "prop_tx_austin_001",
    address: {
      street_address: "1404 Willow St",
      unit: null,
      city: "Austin",
      state: "TX",
      postal_code: "78702",
    },
    price: 850000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1850,
    amenities: ["swimming_pool", "central_ac"],
    zip_code: "78702",
    local_sponsors: [
      {
        sponsor_id: "spn_apex01",
        business_name: "Apex Lending",
        category: "lender" as const,
        placement_tier: "primary" as const,
        phone: "+15125550199",
      },
    ],
  };

  it("passes cleanly with a well-formed record", () => {
    const result = PropertySchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it("passes cleanly for all 5 generated MLS dataset records", () => {
    for (const record of rawData.properties) {
      const result = PropertySchema.safeParse(record);
      expect(result.success).toBe(true);
    }
  });

  it("fails when property_id is missing", () => {
    const { property_id, ...missingId } = validRecord;
    const result = PropertySchema.safeParse(missingId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("property_id");
    }
  });

  it("fails when property_id violates required prefix regex", () => {
    const badId = { ...validRecord, property_id: "invalid_id_123" };
    const result = PropertySchema.safeParse(badId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("property_id");
    }
  });

  it("fails when price is negative", () => {
    const negativePrice = { ...validRecord, price: -50000 };
    const result = PropertySchema.safeParse(negativePrice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Number must be greater than 0");
    }
  });

  it("fails when price is zero (boundary violation)", () => {
    const zeroPrice = { ...validRecord, price: 0 };
    const result = PropertySchema.safeParse(zeroPrice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Number must be greater than 0");
    }
  });

  it("fails when price is a floating point number", () => {
    const floatPrice = { ...validRecord, price: 850000.75 };
    const result = PropertySchema.safeParse(floatPrice);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("price");
    }
  });

  it("fails when postal_code is malformed", () => {
    const badZip = {
      ...validRecord,
      address: { ...validRecord.address, postal_code: "7870" }, // 4 digits
    };
    const result = PropertySchema.safeParse(badZip);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["address", "postal_code"]);
    }
  });

  it("accepts valid extended ZIP+4 postal_code", () => {
    const zipPlus4 = {
      ...validRecord,
      address: { ...validRecord.address, postal_code: "78702-1234" },
    };
    const result = PropertySchema.safeParse(zipPlus4);
    expect(result.success).toBe(true);
  });

  it("fails when state is not a 2-letter uppercase code", () => {
    const badState = {
      ...validRecord,
      address: { ...validRecord.address, state: "tx" },
    };
    const result = PropertySchema.safeParse(badState);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["address", "state"]);
    }
  });

  it("fails when street_address is shorter than 3 characters", () => {
    const shortStreet = {
      ...validRecord,
      address: { ...validRecord.address, street_address: "12" },
    };
    const result = PropertySchema.safeParse(shortStreet);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["address", "street_address"]);
    }
  });

  it("fails when bathrooms is less than minimum 0.5", () => {
    const zeroBath = { ...validRecord, bathrooms: 0 };
    const result = PropertySchema.safeParse(zeroBath);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("bathrooms");
    }
  });

  it("fails when bedrooms is negative", () => {
    const negativeBedrooms = { ...validRecord, bedrooms: -1 };
    const result = PropertySchema.safeParse(negativeBedrooms);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("bedrooms");
    }
  });

  it("allows 0 bedrooms (studio boundary case)", () => {
    const studio = { ...validRecord, bedrooms: 0 };
    const result = PropertySchema.safeParse(studio);
    expect(result.success).toBe(true);
  });

  it("fails when square_feet is below minimum 100", () => {
    const smallSqft = { ...validRecord, square_feet: 99 };
    const result = PropertySchema.safeParse(smallSqft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("square_feet");
    }
  });

  it("fails when unknown amenity is supplied", () => {
    const invalidAmenity = {
      ...validRecord,
      amenities: ["central_ac", "rooftop_helipad"],
    };
    const result = PropertySchema.safeParse(invalidAmenity);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["amenities", 1]);
    }
  });

  it("fails when local sponsor phone number format is invalid", () => {
    const badPhone = {
      ...validRecord,
      local_sponsors: [
        {
          ...validRecord.local_sponsors[0],
          phone: "5125550199", // missing +1 prefix
        },
      ],
    };
    const result = PropertySchema.safeParse(badPhone);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["local_sponsors", 0, "phone"]);
    }
  });

  it("fails when local sponsor category is not in enum", () => {
    const badCategory = {
      ...validRecord,
      local_sponsors: [
        {
          ...validRecord.local_sponsors[0],
          category: "commercial_bank",
        },
      ],
    };
    const result = PropertySchema.safeParse(badCategory);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["local_sponsors", 0, "category"]);
    }
  });

  it("fails when unknown fields are injected (strict enforcement)", () => {
    const injectedField = { ...validRecord, mls_commission_pct: 3.0 };
    const result = PropertySchema.safeParse(injectedField);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("unrecognized_keys");
    }
  });
});
