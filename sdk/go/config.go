package sentinel

import (
	"errors"
	"fmt"
	"os"
)

// Environment variable names used as fallbacks for SentinelClientConfig
// fields that are left unset. Explicit config values always take
// precedence over these.
const (
	EnvAPIKey  = "SENTINEL_API_KEY"
	EnvBaseURL = "SENTINEL_BASE_URL"
)

// ErrMissingAPIKey is returned by authenticated calls when no API key was
// configured explicitly and none was found in the SENTINEL_API_KEY
// environment variable.
var ErrMissingAPIKey = errors.New("sentinel: API key is required; set SentinelClientConfig.APIKey or the SENTINEL_API_KEY environment variable")

// resolve applies explicit-value-over-environment-variable precedence,
// returning a new config with BaseURL/APIKey filled in from the
// environment where they were left empty. It never mutates the receiver.
func (c SentinelClientConfig) resolve() SentinelClientConfig {
	resolved := c
	if resolved.APIKey == "" {
		resolved.APIKey = os.Getenv(EnvAPIKey)
	}
	if resolved.BaseURL == "" {
		resolved.BaseURL = os.Getenv(EnvBaseURL)
	}
	return resolved
}

// requireAPIKey returns ErrMissingAPIKey if no API key is configured.
// Called before issuing authenticated requests so callers get a clear,
// actionable error instead of an opaque 401 from the server.
func (c SentinelClientConfig) requireAPIKey() error {
	if c.APIKey == "" {
		return ErrMissingAPIKey
	}
	return nil
}

// redactKey returns a redacted representation of an API key suitable for
// logs and error messages: it never reveals the key material.
func redactKey(key string) string {
	if key == "" {
		return "<empty>"
	}
	if len(key) <= 4 {
		return "***"
	}
	return "***" + key[len(key)-4:]
}

// String implements fmt.Stringer. The API key is always redacted so this
// type is safe to include in logs.
func (c SentinelClientConfig) String() string {
	return fmt.Sprintf("SentinelClientConfig{BaseURL: %q, APIKey: %s}", c.BaseURL, redactKey(c.APIKey))
}

// GoString implements fmt.GoStringer so that %#v formatting also redacts
// the API key.
func (c SentinelClientConfig) GoString() string {
	return c.String()
}
