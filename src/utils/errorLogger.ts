const SENSITIVE_QUERY_PARAMETER =
  /([?&](?:key|access_token|refresh_token|token|authorization|signature)=)[^&#\s]+/gi;
const MONGODB_CREDENTIALS = /(mongodb(?:\+srv)?:\/\/)[^\s/@]+:[^\s/@]+@/gi;
const BEARER_TOKEN = /(bearer\s+)[a-z0-9._~+/=-]+/gi;

export function redactSensitiveText(text: string): string {
  return text
    .replace(SENSITIVE_QUERY_PARAMETER, "$1[REDACTED]")
    .replace(MONGODB_CREDENTIALS, "$1[REDACTED]@")
    .replace(BEARER_TOKEN, "$1[REDACTED]");
}

/**
 * Produces a bounded string suitable for logs without retaining an error's
 * request configuration, headers, connection strings, or other properties.
 */
export function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactSensitiveText(message).slice(0, 500);
}
