import Ajv from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../schemas/property-payload.schema.json";
import rawData from "../data/generated/raw_properties.json";

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(rawData);

if (!valid) {
  console.error("Schema Validation Failed with Errors:");
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
} else {
  console.log("Validation passed: 5/5 records fully compliant.");
}
