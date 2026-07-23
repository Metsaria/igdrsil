# Igdrsil Distribution — Installer Manifest

This directory holds **the signed model-registry manifest** that the
Igdrsil Flutter installer fetches at first-run to discover available
models.

## Repo & channel

- Production repo: `git@github.com:Metsaria/igdrsil.git` (this repo)
- Distribution channel: `stable` (only channel in v1)
- Pinned URL the installer fetches:
  ```
  https://github.com/Metsaria/igdrsil/releases/download/stable/model-registry.json
  ```

## Why a copy lives in `installer/` (not just GitHub Releases)

The **GitHub Release asset is the binding artefact** — that is what the
installed client hits at runtime. A copy lives here in the repo for two
reasons:

1. **Provenance trail.** Diffing this file across commits shows the
   exact model-list change that landed in each release.
2. **Re-build reproducibility.** If the release asset is ever lost or
   corrupted, we can re-upload from this committed copy.

The repo copy is **not authoritative.** If the GitHub Release asset
and this file disagree, the release wins (it's what clients fetch).
This is by design — the release URL is hard-coded in the binary; the
repo copy is mirror state.

## Generating a new manifest

The signing tool lives in the `plan/igdrsil/client/` workspace, not
here. From the planning repo:

```bash
cd plan/igdrsil/client
dart run tool/installer/sign_model_registry.dart
```

That writes a fresh signed envelope to
`plan/igdrsil/client/tool/installer/build/model-registry.json`.
Copy it into this repo at `release/installer/model-registry.json` and
into the GitHub release in one commit.

## Founder upload runbook

When a new manifest is ready:

1. **Sign the new manifest** (see "Generating a new manifest" above).

2. **Verify it parses:**
   ```bash
   cat model-registry.json | python3 -m json.tool
   ```
   Should show the four envelope keys: `schema_version`, `payload_b64`,
   `signature_b64`, `signed_by`, `signed_at`.

3. **Decode + spot-check the payload:**
   ```bash
   cat model-registry.json | python3 -c "import sys,json,base64; e=json.load(sys.stdin); print(json.dumps(json.loads(base64.b64decode(e['payload_b64'])), indent=2))"
   ```

4. **Push the repo copy** — commit `installer/model-registry.json`
   to this repo with a clear message:
   `installer: bump manifest to <date> (<change>)`

5. **Publish the GitHub release.** On
   <https://github.com/Metsaria/igdrsil/releases>, edit the `stable`
   release (or create it if absent) and upload `model-registry.json`
   as the asset, replacing any prior version.

6. **Verify the release URL resolves:**
   ```bash
   curl -sSL https://github.com/Metsaria/igdrsil/releases/download/stable/model-registry.json | head -c 200
   ```
   Should return JSON, not a 404.

## What's in the v1 manifest (2026-06-12)

Two `tapio` (chat-facing) models:

| Model | Ollama ref | RAM tier | Default? |
|---|---|---|---|
| Qwen3 4B Instruct (Q4_K_M) | `qwen3:4b-instruct-q4_K_M` | 16 GB (`passt_gut`) | ✅ priority 1 |
| Qwen3 1.7B (Q4_K_M) | `qwen3:1.7b-q4_K_M` | 8 GB (`knapp`) | priority 2 |

**Family-aligned with the locked Qwen3-Embedding-8B retrieval stack.**

**NOT in the manifest:** Dupin's verdict-LLM (`gemma2:9b-instruct-q4_K_M`)
is a server-side, eval-pipeline model locked separately. The installer
does not download Dupin's model.

## Trust anchor

Manifest envelope is signed with **Ed25519** against the public key
bundled into the binary at:

```
plan/igdrsil/client/assets/installer/model-registry-issuer.pub.bin
```

Issuer id is `igdrsil-release-key-2026` and is hard-coded in
`plan/igdrsil/client/lib/data/installer/manifest_fetcher.dart:54`.

A manifest signed with a different key, or claiming a different
`signed_by`, fails verification and the installer falls back to its
closed `signatureInvalid` failure mode.

The dev key custody lifecycle is documented in `plan/PROJECT-STATE.md`
under WP-INSTALLER. v1 dogfood uses the dev key; release-time CI
(per `plan/PRERELEASE-STEPS.md` item 2) replaces it with the
vault-streamed production key per Q26 custody.

## See also

- `../README.md` — top-level distribution structure
- `../docs/distribution-model.md` — Option B decision capture
- `plan/igdrsil/client/lib/data/installer/manifest_fetcher.dart` —
  the fetch + verify path the installer runs at boot
- `plan/igdrsil/client/test/data/installer/manifest_fetcher_test.dart` —
  canonical test fixture for the envelope shape
- `plan/igdrsil/client/tool/installer/sign_model_registry.dart` —
  the signing tool that produces this file
