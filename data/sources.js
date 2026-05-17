window.RENTAL_DATA_SOURCES = [
  {
    slug: "linz-data-service",
    title: "LINZ Data Service",
    category: "National property base layer",
    what: "NZ addresses, parcels, titles-related spatial data, roads, aerial imagery, and building outlines.",
    access: "API/WFS with LINZ Data Service API key.",
    fit: "Best base layer for address lookup, parcel context, imagery, and map-backed property records.",
    sourceUrl: "https://www.linz.govt.nz/products-services/data/linz-data-service",
    actions: ["Create or add a LINZ API key locally.", "Resolve address to coordinates and parcel context.", "Cache source responses against the property dossier."]
  },
  {
    slug: "linz-web-services",
    title: "LINZ web services",
    category: "National geospatial API access",
    what: "WFS, WMS, and other web service access into LINZ datasets.",
    access: "API key required for most service calls.",
    fit: "Address lookup, parcel map, building-outline overlays, and basemap layers.",
    sourceUrl: "https://www.linz.govt.nz/guidance/data-service/linz-data-service-guide/web-services",
    actions: ["Choose WFS for feature data.", "Choose WMS/basemaps for map rendering.", "Store endpoint presets locally."]
  },
  {
    slug: "linz-building-outlines",
    title: "LINZ Building Outlines",
    category: "Building footprint data",
    what: "Building footprint shapes, not internal floor plans.",
    access: "LINZ API/WFS/download.",
    fit: "Estimate structures, site coverage, external form, and likely building placement.",
    sourceUrl: "https://data.linz.govt.nz/from/data.linz.govt.nz/layer/101290-nz-building-outlines/",
    actions: ["Fetch outlines around the property coordinate.", "Compare footprint with uploaded floor plans.", "Flag mismatch risks for manual review."]
  },
  {
    slug: "stats-nz-api",
    title: "Stats NZ API",
    category: "National statistics API",
    what: "Machine-readable Stats NZ datasets.",
    access: "Registration/subscription through Stats NZ API Portal.",
    fit: "Regional market/context module for rental launch decisions.",
    sourceUrl: "https://portal.apis.stats.govt.nz/",
    actions: ["Add API key locally.", "Pull regional/territorial-authority statistics.", "Cache useful tables for offline review."]
  },
  {
    slug: "stats-nz-building-consents",
    title: "Stats NZ Building Consents",
    category: "Consent statistics",
    what: "Consent counts, value, and floor area by geography, not individual floor plans.",
    access: "Stats NZ tables/API, depending on dataset route.",
    fit: "Market and local construction-context module.",
    sourceUrl: "https://datainfoplus.stats.govt.nz/item/nz.govt.stats/ee083b32-8c10-4ccf-b1ee-a4990b27273c/114",
    actions: ["Show TA/region consent trend.", "Explain that this is aggregate data.", "Link property-specific consent docs to council source pages."]
  },
  {
    slug: "data-govt-nz",
    title: "data.govt.nz APIs",
    category: "Dataset discovery",
    what: "Dataset metadata and some row-level datasets from NZ agencies.",
    access: "CKAN metadata APIs and DataStore where available.",
    fit: "Discover council/open datasets related to hazards, zoning, consents, and property context.",
    sourceUrl: "https://www.data.govt.nz/catalogue-guide/using-data-govt-nz-apis",
    actions: ["Search for property-related datasets by council.", "Save useful dataset links locally.", "Track which datasets are API-ready vs manual."]
  },
  {
    slug: "auckland-open-data",
    title: "Auckland Council Open Data / GeoMaps",
    category: "Auckland council enrichment",
    what: "GIS/property layers, hazards, zoning, services, and spatial context.",
    access: "ArcGIS/open data where available.",
    fit: "Auckland-specific enrichment for hazards, planning, utilities, and property map context.",
    sourceUrl: "https://new.aucklandcouncil.govt.nz/en/geospatial.html",
    actions: ["Detect Auckland address and show Auckland-specific links.", "Save relevant GeoMaps layers.", "Use manually ordered property files for floor plans."]
  },
  {
    slug: "auckland-arcgis-rest",
    title: "Auckland ArcGIS REST",
    category: "Auckland GIS experiments",
    what: "Public GIS service directory for Auckland Council layers.",
    access: "ArcGIS REST endpoints.",
    fit: "Good local API experiment surface for property enrichment.",
    sourceUrl: "https://mapspublic.aucklandcouncil.govt.nz/arcgis3/rest/services",
    actions: ["Browse services and pick stable layers.", "Prototype query calls locally.", "Cache service metadata for chosen property."]
  },
  {
    slug: "christchurch-open-data",
    title: "Christchurch Open Data APIs",
    category: "Christchurch council enrichment",
    what: "ESRI MapService, Feature Service, and WFS endpoints.",
    access: "Open data APIs.",
    fit: "Christchurch-specific property, hazards, planning, and infrastructure context.",
    sourceUrl: "https://dateno.io/registry/catalog/cdi00002794/",
    actions: ["Detect Christchurch address and show council-specific links.", "Query open GIS layers locally.", "Attach Christchurch LIM/property docs."]
  },
  {
    slug: "auckland-property-files",
    title: "Auckland property files",
    category: "Manual council documents",
    what: "Property file, latest floor plan if available, consent documents, correspondence, and related records.",
    access: "Manual/order, usually not public API.",
    fit: "Store downloaded PDFs locally and tag likely floor-plan pages.",
    sourceUrl: "https://www.aucklandcouncil.govt.nz/buying-property/order-property-report/pages/order-property-file.aspx",
    actions: ["Order property file manually.", "Upload downloaded PDFs into local vault.", "Tag floor plan, consent, CCC, drainage, LIM."]
  },
  {
    slug: "wellington-building-consent-search",
    title: "Wellington building consent search",
    category: "Manual council documents",
    what: "Building consent/permit copies, which may include floor plans.",
    access: "Manual/order via Wellington City Council.",
    fit: "Store downloaded consent/floor-plan PDFs locally.",
    sourceUrl: "https://wellington.govt.nz/property-rates-and-building/property/reports/building-consent-search/building-plan-search-form",
    actions: ["Search issued consents/permits.", "Order documents manually.", "Upload returned documents into local vault."]
  },
  {
    slug: "christchurch-lim-property-services",
    title: "Christchurch LIM/property services",
    category: "Manual council documents",
    what: "LIM, property file, drainage plan, and property-service documents.",
    access: "Manual/order via Christchurch City Council.",
    fit: "Store downloaded docs locally for due diligence and listing prep.",
    sourceUrl: "https://ccc.govt.nz/consents-and-licences/property-information-and-lims",
    actions: ["Order relevant Christchurch docs.", "Upload returned PDFs.", "Tag LIM/property file/drainage/floor-plan evidence."]
  }
];
