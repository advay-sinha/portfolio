/**
 * pin-budget.ts — runtime enforcement of the single-pin law
 * (interaction-principles §4: max pins per page; homepage-experience
 * §8: pinned scroll sequences cap = 1, held by the Vault;
 * implementation-architecture §4.2: a second pin registration throws).
 *
 * The budget is a module singleton, not a convention: any island that
 * wants a ScrollTrigger pin must claim it here first. A second claim
 * throws in development (design failure, fail loudly) and refuses
 * silently in production (never crash the page over choreography).
 */

let holder: string | null = null;

export function claimPin(id: string): () => void {
  if (holder !== null && holder !== id) {
    const message = `[descent] Pin budget exceeded: "${id}" requested the homepage pin but "${holder}" already holds it (limit: 1 — interaction-principles §4).`;
    if (process.env.NODE_ENV !== "production") throw new Error(message);
    console.warn(message);
    return () => {};
  }
  holder = id;
  return () => {
    if (holder === id) holder = null;
  };
}
