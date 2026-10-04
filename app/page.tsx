import { PropertyCard } from "@/src/components/PropertyCard";
import rawData from "@/data/generated/raw_properties.json";

export default function Home() {
  const properties = rawData.properties || [];

  const invalidSample = {
    property_id: "invalid_id_format",
    price: -50000,
    address: {
      street_address: "X",
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header / Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                MLS Ingest Engine Active
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Austin Property Listings
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Normalized broker listings verified with schema integrity and sponsor placement rules.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                {properties.length} Verified Records
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Active Listings</h2>
          <span className="text-xs text-slate-500">Sorted by verified ingest time</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <PropertyCard key={prop.property_id} rawRecord={prop} />
          ))}
        </div>

        {/* Resilience Verification Showcase */}
        <section className="mt-16 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Schema Validation & Fallback Test
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Demonstrating how <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">PropertyCard</code> safely catches unverified or malformed records without crashing the view.
          </p>

          <div className="mt-4 max-w-md">
            <PropertyCard rawRecord={invalidSample} />
          </div>
        </section>
      </section>
    </main>
  );
}
