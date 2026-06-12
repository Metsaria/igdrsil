# Igdrsil — Release Repository

This is the **distribution repository** for Igdrsil — the on-prem AI agent platform for German legal firms (Kanzleien).

It is **NOT the source code repo.** Source code lives elsewhere (the `plan/` workspace privately, and components like `igdrsil/server` and `igdrsil/client` are reviewed and built there). This repo holds:

1. **Signed manifests** that the installed Igdrsil client fetches at runtime to discover available local-AI models.
2. **Binary release artefacts** — `.dmg` / `.msi` / `.AppImage` for each tagged version (uploaded to GitHub Releases, mirrored under `binaries/` for provenance).
3. **Release notes + checksums** under `releases/v*/`.
4. **Distribution-model documentation** under `docs/` — locked decisions about how Igdrsil ships, why, and to whom.

## Repository layout

```
release/
├── README.md                         ← you are here
├── installer/
│   ├── README.md                     ← manifest upload runbook + trust anchor docs
│   └── model-registry.json           ← signed Ed25519 manifest, fetched at install
│
├── binaries/                         ← provenance copies of release binaries
│   ├── macos/                        ← .dmg files (one per tagged release)
│   ├── linux/                        ← .AppImage / .deb / .rpm
│   └── windows/                      ← .msi / .exe installers
│
├── releases/                         ← per-version metadata
│   └── README.md                     ← format + lifecycle of release notes
│
├── docs/
│   └── distribution-model.md         ← Option B decision; channel semantics; trust model
│
└── .github/
    └── workflows/                    ← (future) GitHub Actions for release-signing pipeline
                                         per pre-release item 2 of plan/PRERELEASE-STEPS.md
```

## Distribution channel

v1 has a single channel: **`stable`**.

Every artefact published in `stable` is:
1. Signed (Ed25519 for manifests; Apple Developer ID + EV cert for binaries — pre-release item 1)
2. Tagged on the GitHub release (the binding URL is the release-asset URL, NOT the repo file)
3. Mirrored back into this repo under the appropriate subfolder for provenance

Future channels (`beta`, `nightly`) follow the same pattern — separate release tags, separate manifests under `installer/<channel>/model-registry.json`. Not in v1.

## Trust anchors

| Artefact class | Signing key | Pinned in |
|---|---|---|
| `installer/model-registry.json` | Ed25519 dev key (v1 dogfood) → vault-streamed key per Q26 (v1.1+) | `igdrsil/client/assets/installer/model-registry-issuer.pub.bin` |
| macOS binaries | Apple Developer ID Application: Yggdrasil GmbH | macOS Gatekeeper |
| Windows binaries | DigiCert EV cert, SafeNet HSM | Windows SmartScreen |

Cert procurement is tracked in `plan/PRERELEASE-STEPS.md` item 1.

## Who can publish

- v1 dogfood: founder hand-publishes from his M-series box (manual `git push` + GitHub Releases UI upload)
- v1.1+: GitHub Actions release pipeline reads cert secrets from the workflow env and signs in CI (per `plan/PRERELEASE-STEPS.md` item 2)

## Strategic alignment

This repo is the operational expression of three strategy.md principles:

- **Sovereignty** — every artefact published here is signed; clients fail-closed on signature verification failure; no manifest or binary is "trusted by default"
- **Democratisation** — customers fetch a single signed manifest from a single pinned URL; no developer-mode workarounds, no cert dialogs, no admin password prompts (the Mac App Store posture would have failed this; see `plan/PROJECT-STATE.md` OQ-036)
- **Craftsmanship** — provenance committed in-repo (binaries, manifests, signatures); releases tagged not branched; rollback path is `git checkout v1.0.0` + republish, not "hope nobody noticed"

## See also

- `installer/README.md` — manifest upload runbook
- `docs/distribution-model.md` — full Option-B decision capture
- `plan/PRERELEASE-STEPS.md` — cert procurement + CI/CD pipeline establishment (the founder-action queue for graduating from manual → automated releases)
- `plan/PROJECT-STATE.md` — durable session-spanning state (lives in the planning repo, not here)
