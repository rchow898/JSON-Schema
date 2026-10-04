import React from "react";
import { Property, PropertySchema } from "../schemas/property";

interface PropertyCardProps {
  rawRecord: unknown;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ rawRecord }) => {
  const result = PropertySchema.safeParse(rawRecord);

  if (!result.success) {
    // Fail safely without crashing the parent list view
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">Unable to display property listing</p>
        <p className="text-xs text-red-500">Record failed schema validation standards.</p>
      </div>
    );
  }

  const property: Property = result.data;
  const primarySponsor = property.local_sponsors.find((s) => s.placement_tier === "primary");

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ${property.price.toLocaleString("en-US")}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {property.bedrooms} bd | {property.bathrooms} ba | {property.square_feet} sqft
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {property.address.street_address}
          {property.address.unit ? ` Ste ${property.address.unit}` : ""}, {property.address.city},{" "}
          {property.address.state} {property.zip_code}
        </p>

        {primarySponsor && (
          <aside className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400">Sponsored by</span>
            <span className="text-xs font-semibold text-slate-700">{primarySponsor.business_name}</span>
          </aside>
        )}
      </div>
    </article>
  );
};
