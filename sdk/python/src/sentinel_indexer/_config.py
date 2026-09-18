"""Internal config resolution helpers shared by the sync and async clients.

Precedence for both fields is: explicit constructor argument > environment
variable. Neither the API key nor any derived value is ever logged or
included in exception messages verbatim — see :func:`redact_key`.
"""

from __future__ import annotations

import os
from typing import Optional

SENTINEL_API_KEY_ENV = "SENTINEL_API_KEY"
SENTINEL_BASE_URL_ENV = "SENTINEL_BASE_URL"


class SentinelConfigError(ValueError):
    """Raised when required client configuration is missing or invalid."""


def resolve_api_key(api_key: Optional[str]) -> str:
    """Resolve the API key from an explicit value or SENTINEL_API_KEY.

    Raises:
        SentinelConfigError: if neither source provides a non-empty key.
    """
    resolved = api_key or os.environ.get(SENTINEL_API_KEY_ENV, "")
    if not resolved:
        raise SentinelConfigError(
            "Sentinel API key is required: pass api_key= explicitly or set "
            f"the {SENTINEL_API_KEY_ENV} environment variable."
        )
    return resolved


def resolve_api_url(api_url: Optional[str]) -> str:
    """Resolve the base URL from an explicit value or SENTINEL_BASE_URL.

    Raises:
        SentinelConfigError: if neither source provides a non-empty URL.
    """
    resolved = api_url or os.environ.get(SENTINEL_BASE_URL_ENV, "")
    if not resolved:
        raise SentinelConfigError(
            "Sentinel api_url is required: pass api_url= explicitly or set "
            f"the {SENTINEL_BASE_URL_ENV} environment variable."
        )
    return resolved.rstrip("/")


def redact_key(key: str) -> str:
    """Return a redacted form of an API key, safe to log or print."""
    if not key:
        return "<empty>"
    if len(key) <= 4:
        return "***"
    return f"***{key[-4:]}"
