import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SentinelClient, SentinelError } from "../src/index.js";

const ORIGINAL_ENV = { ...process.env };

describe("config precedence", () => {
  beforeEach(() => {
    process.env.SENTINEL_API_KEY = "env-key";
    process.env.SENTINEL_BASE_URL = "https://env.example.com";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("prefers explicit apiKey/apiUrl over env vars", () => {
    const client = new SentinelClient({
      apiUrl: "https://explicit.example.com",
      apiKey: "explicit-key",
      network: "testnet",
    });

    expect(client.toString()).toContain("https://explicit.example.com");
    expect(client.toString()).not.toContain("explicit-key");
  });

  it("falls back to env vars when config omits apiKey/apiUrl", () => {
    const client = new SentinelClient({ network: "testnet" });

    expect(client.toString()).toContain("https://env.example.com");
  });

  it("throws a clear CONFIG error when apiKey is missing everywhere", () => {
    delete process.env.SENTINEL_API_KEY;

    expect(() => new SentinelClient({ apiUrl: "https://x.example.com", network: "testnet" })).toThrow(
      SentinelError,
    );
    try {
      new SentinelClient({ apiUrl: "https://x.example.com", network: "testnet" });
    } catch (err) {
      expect(err).toBeInstanceOf(SentinelError);
      expect((err as SentinelError).code).toBe("CONFIG");
    }
  });

  it("throws a clear CONFIG error when apiUrl is missing everywhere", () => {
    delete process.env.SENTINEL_BASE_URL;

    expect(() => new SentinelClient({ apiKey: "explicit-key", network: "testnet" })).toThrow(
      SentinelError,
    );
  });
});

describe("redaction", () => {
  beforeEach(() => {
    delete process.env.SENTINEL_API_KEY;
    delete process.env.SENTINEL_BASE_URL;
  });

  it("never includes the raw API key in toString()", () => {
    const client = new SentinelClient({
      apiUrl: "https://x.example.com",
      apiKey: "super-secret-value",
      network: "testnet",
    });

    const repr = client.toString();
    expect(repr).not.toContain("super-secret-value");
    expect(repr).toContain("***");
  });
});
