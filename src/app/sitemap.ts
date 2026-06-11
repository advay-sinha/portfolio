import type { MetadataRoute } from "next";

import { SYSTEMS } from "@/content/systems";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap derives from content/ — a dossier exists in the map exactly
 * when it exists in systems.ts (the same source generateStaticParams
 * reads), so the sitemap can never claim a route the build didn't make.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...SYSTEMS.filter((s) => s.dossier !== undefined).map((s) => ({
      url: `${SITE_URL}/systems/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
