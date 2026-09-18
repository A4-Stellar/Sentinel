# sentinel-go-sdk

Go client SDK for the [Sentinel](https://github.com/A4-Stellar/Sentinel) Soroban event indexer.

## Regenerating OpenAPI models

See [docs/sdk-regeneration.md](../../docs/sdk-regeneration.md) for the full cross-SDK procedure (regenerating all SDKs together, version consistency, testing after regeneration). Quick version — install the generator dependency once with `python3 -m pip install PyYAML`, then run:

```bash
python3 scripts/generate_sdk_models.py --language go
```

Generated models live in `github.com/Depo-dev/sentinel/sdk/go/openapi`.
