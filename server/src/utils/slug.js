export function toSlugBase(input, fallback = "product") {
  const normalized = String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) {
    return normalized;
  }

  const fallbackSlug = String(fallback || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return fallbackSlug || "product";
}

export function buildUniqueSlug(baseSlug, sequence = 1) {
  const normalizedBase = toSlugBase(baseSlug);
  if (!Number.isFinite(sequence) || sequence <= 1) {
    return normalizedBase;
  }
  return `${normalizedBase}-${Math.floor(sequence)}`;
}
