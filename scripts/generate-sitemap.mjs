/**
 * Generates sitemap.xml and robots.txt into /public before Vite build.
 *
 * Env (Vercel / local):
 *   VITE_SITE_URL  — public site origin, e.g. https://indlearns.com
 *   VITE_API_URL   — backend API base, e.g. https://your-api.onrender.com/api
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SITE_URL = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://indlearns.com").replace(
  /\/$/,
  ""
);
const API_BASE = (process.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const STATIC_FALLBACK_ROUTES = [
  "/",
  "/courses",
  "/mentorship",
  "/about",
  "/contact",
  "/register",
  "/login",
  "/privacy",
  "/terms",
  "/refund",
  "/jobs",
  "/workshops",
  "/events",
];

const buildFallbackSitemap = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = STATIC_FALLBACK_ROUTES.map(
    (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.7"}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const buildRobotsTxt = () => `# IndLearn — robots.txt
User-agent: *
Allow: /

# Private / authenticated areas
Disallow: /admin
Disallow: /admins/
Disallow: /superadmin
Disallow: /student
Disallow: /tutor
Disallow: /partner

# Checkout & payment callbacks
Disallow: /checkout
Disallow: /payment/
Disallow: /zoho/

# Auth recovery
Disallow: /forgot-password
Disallow: /reset-password

Sitemap: ${SITE_URL}/sitemap.xml
`;

async function fetchDynamicSitemap() {
  const url = `${API_BASE}/public/sitemap.xml?site=${encodeURIComponent(SITE_URL)}`;
  const res = await fetch(url, { headers: { Accept: "application/xml" } });
  if (!res.ok) throw new Error(`Sitemap API ${res.status}`);
  const text = await res.text();
  if (!text.includes("<urlset")) throw new Error("Invalid sitemap response");
  return text;
}

async function main() {
  mkdirSync(publicDir, { recursive: true });

  let sitemap;
  try {
    sitemap = await fetchDynamicSitemap();
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    console.log(`[sitemap] Fetched dynamic sitemap (${urlCount} URLs) from ${API_BASE}`);
  } catch (error) {
    console.warn(`[sitemap] API unavailable (${error.message}) — using static fallback`);
    sitemap = buildFallbackSitemap();
  }

  writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");
  writeFileSync(join(publicDir, "robots.txt"), buildRobotsTxt(), "utf8");
  console.log(`[sitemap] Wrote public/sitemap.xml and public/robots.txt for ${SITE_URL}`);
}

main().catch((error) => {
  console.error("[sitemap] Failed:", error);
  process.exit(1);
});
