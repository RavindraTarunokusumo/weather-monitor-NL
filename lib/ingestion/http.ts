import type { JsonFetcher } from "./base";

function safeUrl(value: string) {
  const parsed = new URL(value);
  parsed.search = "";
  return parsed.toString().replace(/\/$/, "");
}

export async function fetchJson(
  url: string,
  options: RequestInit & { fetcher?: JsonFetcher } = {},
): Promise<unknown> {
  const { fetcher = fetch, ...init } = options;
  const response = await fetcher(url, init);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${safeUrl(url)}`);
  }

  return response.json();
}
