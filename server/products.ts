export interface ProductEntry {
  id: string;
  name: string;
  enabled: boolean;
}

export const PRODUCTS: ProductEntry[] = [
  { id: "muse", name: "Meta Muse", enabled: true },
  { id: "grok", name: "Grok", enabled: false },
  { id: "gemini-builder", name: "Gemini Gems", enabled: false },
];

export function getEnabledProducts(): ProductEntry[] {
  return PRODUCTS.filter((p) => p.enabled);
}

export function getProductById(id: unknown): ProductEntry | undefined {
  if (typeof id !== "string" || !id.trim()) return undefined;
  return PRODUCTS.find((p) => p.id === id);
}

export function isKnownProduct(id: unknown): id is string {
  return Boolean(getProductById(id));
}
