import { getSafeErrorMessage, redactSensitiveText } from "../errorLogger";

describe("errorLogger", () => {
  it("redacts credentials from URLs, connection strings, and authorization text", () => {
    const secret = "SECRET_API_KEY";
    const input =
      `https://youtube.googleapis.com/youtube/v3/videos?key=${secret}&part=snippet ` +
      `mongodb+srv://user:password@example.mongodb.net/test Bearer ${secret}`;

    const result = redactSensitiveText(input);

    expect(result).not.toContain(secret);
    expect(result).not.toContain("user:password");
    expect(result).toContain("key=[REDACTED]");
    expect(result).toContain("part=snippet");
    expect(result).toContain("mongodb+srv://[REDACTED]@example.mongodb.net");
    expect(result).toContain("Bearer [REDACTED]");
  });

  it("logs only a bounded, redacted error message", () => {
    const error = new Error(
      `Request failed: https://example.test?key=SECRET_API_KEY ${"x".repeat(600)}`
    ) as Error & { config: { auth: string } };
    error.config = { auth: "SECRET_API_KEY" };

    const result = getSafeErrorMessage(error);

    expect(result).not.toContain("SECRET_API_KEY");
    expect(result).not.toContain("config");
    expect(result.length).toBeLessThanOrEqual(500);
  });

  it("handles non-Error values", () => {
    expect(getSafeErrorMessage("failure?token=secret")).toBe(
      "failure?token=[REDACTED]"
    );
  });
});
