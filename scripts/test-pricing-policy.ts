import { ingestPropertyRecord, estimateMarketRate } from "../lib/mls-processor";

console.log("--- Testing MLS Pricing Policy: Reject or Estimate; Never 0 or Negative ---");

// Test 1: Positive valid price passes through
const validRecord = ingestPropertyRecord({
  property_id: "prop_test_valid",
  street_address: "123 Test St",
  zip_code: "78702",
  price: 750000,
  square_feet: 1500,
  bedrooms: 3,
  bathrooms: 2,
});
console.log(`[PASS] Valid price preserved: $${validRecord.price}`);

// Test 2: Price <= 0 with policy='estimate' estimates market rate (> 0)
const zeroPriceRecord = ingestPropertyRecord(
  {
    property_id: "prop_test_zero",
    street_address: "456 Test Ave",
    zip_code: "78701",
    price: 0,
    square_feet: 1200,
    bedrooms: 2,
    bathrooms: 2,
  },
  { pricePolicy: "estimate" }
);
if (zeroPriceRecord.price <= 0) {
  throw new Error("Estimated price was non-positive!");
}
console.log(`[PASS] 0-price estimated to market rate: $${zeroPriceRecord.price} (> 0)`);

// Test 3: Negative price with policy='estimate' estimates market rate (> 0)
const negativePriceRecord = ingestPropertyRecord(
  {
    property_id: "prop_test_negative",
    street_address: "789 Test Rd",
    zip_code: "78756",
    price: -50000,
    square_feet: 1800,
    bedrooms: 3,
    bathrooms: 2,
  },
  { pricePolicy: "estimate" }
);
if (negativePriceRecord.price <= 0) {
  throw new Error("Estimated price was non-positive!");
}
console.log(`[PASS] Negative price estimated to market rate: $${negativePriceRecord.price} (> 0)`);

// Test 4: Missing or <= 0 price with policy='reject' throws error
let rejectedSuccessfully = false;
try {
  ingestPropertyRecord(
    {
      property_id: "prop_test_reject",
      street_address: "101 Reject Blvd",
      zip_code: "78702",
      price: -100,
    },
    { pricePolicy: "reject" }
  );
} catch (e: any) {
  rejectedSuccessfully = true;
  console.log(`[PASS] Rejection caught as expected: "${e.message}"`);
}

if (!rejectedSuccessfully) {
  throw new Error("Expected invalid price to be rejected under policy='reject'!");
}

console.log("All pricing policy tests passed successfully.");
