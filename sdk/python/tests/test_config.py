"""Tests for API key / base URL precedence and redaction."""

import pytest

from sentinel_indexer import AsyncSentinelClient, SentinelClient, SentinelConfigError
from tests.conftest import API_KEY, API_URL


class TestPrecedence:
    def test_explicit_values_win_over_env(self, monkeypatch):
        monkeypatch.setenv("SENTINEL_API_KEY", "env-key")
        monkeypatch.setenv("SENTINEL_BASE_URL", "https://env.example.com")

        client = SentinelClient(api_url=API_URL, api_key=API_KEY)

        assert client._api_key == API_KEY
        assert client._api_url == API_URL

    def test_falls_back_to_env_when_omitted(self, monkeypatch):
        monkeypatch.setenv("SENTINEL_API_KEY", "env-key")
        monkeypatch.setenv("SENTINEL_BASE_URL", "https://env.example.com")

        client = SentinelClient()

        assert client._api_key == "env-key"
        assert client._api_url == "https://env.example.com"

    def test_async_client_precedence_matches_sync(self, monkeypatch):
        monkeypatch.setenv("SENTINEL_API_KEY", "env-key")
        monkeypatch.setenv("SENTINEL_BASE_URL", "https://env.example.com")

        client = AsyncSentinelClient(api_key=API_KEY)

        assert client._api_key == API_KEY
        assert client._api_url == "https://env.example.com"


class TestMissingConfig:
    def test_missing_api_key_raises_clear_error(self, monkeypatch):
        monkeypatch.delenv("SENTINEL_API_KEY", raising=False)

        with pytest.raises(SentinelConfigError, match="API key is required"):
            SentinelClient(api_url=API_URL)

    def test_missing_api_url_raises_clear_error(self, monkeypatch):
        monkeypatch.delenv("SENTINEL_BASE_URL", raising=False)

        with pytest.raises(SentinelConfigError, match="api_url is required"):
            SentinelClient(api_key=API_KEY)


class TestRedaction:
    def test_repr_never_contains_raw_key(self):
        client = SentinelClient(api_url=API_URL, api_key=API_KEY)
        assert API_KEY not in repr(client)
        assert "***" in repr(client)

    def test_async_repr_never_contains_raw_key(self):
        client = AsyncSentinelClient(api_url=API_URL, api_key=API_KEY)
        assert API_KEY not in repr(client)
        assert "***" in repr(client)
