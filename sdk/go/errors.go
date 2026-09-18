package sentinel

import (
	"encoding/json"
	"fmt"
)

// SentinelApiError is the typed error returned for non-2xx API responses,
// optionally after exhausting the configured retry policy (Attempts > 1).
type SentinelApiError struct {
	Status   int
	Code     string
	Message  string
	Field    string
	Attempts int
}

func (e *SentinelApiError) Error() string {
	suffix := ""
	if e.Field != "" {
		suffix = fmt.Sprintf(" (field: %s)", e.Field)
	}
	if e.Attempts > 1 {
		return fmt.Sprintf("sentinel API error %d (%s) after %d attempts: %s%s", e.Status, e.Code, e.Attempts, e.Message, suffix)
	}
	return fmt.Sprintf("sentinel API error %d (%s): %s%s", e.Status, e.Code, e.Message, suffix)
}

func parseApiError(status int, body string) *SentinelApiError {
	var env struct {
		Error struct {
			Code    string `json:"code"`
			Message string `json:"message"`
			Field   string `json:"field,omitempty"`
		} `json:"error"`
	}
	if err := json.Unmarshal([]byte(body), &env); err == nil && env.Error.Code != "" {
		return &SentinelApiError{Status: status, Code: env.Error.Code, Message: env.Error.Message, Field: env.Error.Field}
	}
	msg := body
	if msg == "" {
		msg = fmt.Sprintf("HTTP %d", status)
	}
	return &SentinelApiError{Status: status, Code: "INTERNAL", Message: msg}
}

// RequestError represents a transport-level failure (e.g. a network error)
// that occurred after the configured retry policy was exhausted.
type RequestError struct {
	Attempts int
	Err      error
}

func (e *RequestError) Error() string {
	return fmt.Sprintf("request failed after %d attempt(s): %v", e.Attempts, e.Err)
}

func (e *RequestError) Unwrap() error {
	return e.Err
}
