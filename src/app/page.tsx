import { Portfolio } from "@/portfolio/Portfolio";

/**
 * Homepage — the cyberpunk descent (Portfolio.dc.html, implemented).
 *
 * Six depths over an anime-cyberpunk atmosphere: ABOUT (interactive
 * neural core), PROJECTS (blueprint vault), JOURNEY (operations
 * ledger), CERTS (credential archive), TERMINAL (interactive shell),
 * CONTACT (channel registry). The component tree is client-rendered but
 * server-rendered for first paint, so all content ships in the initial
 * HTML; every section reads the typed content/ modules.
 *
 * The dossier route (/systems/[slug]) remains the page's single Cut.
 */
export default function Home() {
  return <Portfolio />;
}
