const DEFAULT_API_BASE_URL = "http://localhost:9001/api";

export function getServerApiBaseUrl(): string {
  const baseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  return baseUrl.replace(/\/$/, "");
}

export function buildServerApiUrl(
  pathname: string,
  search = "",
): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getServerApiBaseUrl()}${normalizedPath}${search}`;
}
