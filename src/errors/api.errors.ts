// A base class for all your application's operational errors
export class AppError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// A specific error for YouTube API failures
export class YouTubeApiError extends AppError {
  constructor(message: string, originalError: unknown) {
    // Extract key details from the original Google API error
    // Response data contains YouTube's structured error without the request
    // configuration, which can contain the API key. Preserve the original
    // error only as a non-enumerable cause for internal inspection.
    const details = hasResponseData(originalError)
      ? originalError.response.data
      : undefined;

    super(message, details, { cause: originalError });
    this.name = "YouTubeApiError";
  }
}

// Helper to check the structure of the Google API error
const hasResponseData = (
  error: unknown
): error is { response: { data: unknown } } => {
  return (
    error !== null &&
    typeof error === "object" &&
    "response" in error &&
    error.response !== null &&
    typeof error.response === "object" &&
    "data" in error.response
  );
};

export class MissingApiKeyError extends AppError {
  constructor() {
    super(
      "This tool requires a YouTube API Key. Please add YOUTUBE_API_KEY to your MCP client configuration to unlock this feature. See the project README for setup instructions."
    );
    this.name = "MissingApiKeyError";
  }
}
