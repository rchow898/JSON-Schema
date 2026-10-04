# ADR 001: Property Ingestion Data Contract and Amenity Architecture

## Status
Accepted

## Context
Our platform ingests raw, disparate listing notes from external brokers, runs them through an LLM extraction pipeline, and serves structured records to web cards, detail views, voice search, and local sponsors.
We needed a runtime validation contract that eliminates schema drift, enforces strict type guarantees, and handles the categorization of amenities and local sponsors.

## Decision
1. **Single Source of Truth:** We adopt Zod (`src/schemas/property.ts`) as our definitive contract source. JSON Schemas required for AI Studio structured output are compiled directly from this definition.
2. **Amenity Representation:** We choose a **hybrid controlled-vocabulary strategy**:
   - At the ingestion API contract layer, amenities remain a strict enum set (`AmenityEnum`) within an array.
   - At the persistence layer (PostgreSQL), amenities are normalized into a relational join table (`PropertyAmenity` linking `properties.id` to `amenities.id`).
3. **Postal Redundancy Removal:** The top-level `zip_code` property is deprecated in favor of `address.postal_code` to eliminate dual-source synchronization issues.

## Alternatives Considered
- **Uncontrolled Free-Text Array:** Rejected due to search degradation (e.g., "A/C", "Central AC", "air-conditioning" scatter query indexes).
- **Postgres JSONB Document Store:** Rejected for sponsors and amenities; loses referential integrity when sponsors update contact details or tier levels across thousands of listings.

## Consequences
- **Positive:** Full TypeScript type safety across frontend components; invalid LLM outputs fail fast at runtime before hitting database drivers.
- **Negative:** Adding a new platform amenity requires updating the central enum dictionary and generating an updated schema for downstream LLM prompts.
