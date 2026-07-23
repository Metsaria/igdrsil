# Igdrsil — Public Releases

**Finally, AI for confidential work.**

Igdrsil brings your team, documents and local AI agents into one shared workspace. Contracts, patient files, applications and internal chats stay in your infrastructure.

This repository is the public distribution point for Igdrsil releases. It distributes software only. It does not contain source code, customer data, telemetry, usage data or support exports.

## What is here

1. **Signed model manifests** — used by installed Igdrsil clients to verify available local AI models.
2. **Release binaries** — installers for macOS, Windows and Linux, published through GitHub Releases.
3. **Checksums and release notes** — versioned records for each release.
4. **Distribution documentation** — how release channels, signatures and trust boundaries work.

## Why this exists

Igdrsil is built for work that cannot go to the cloud. The release path has to match that promise:

- **No cloud AI.** Models run locally in the customer's infrastructure.
- **No telemetry.** We see no content and no usage data.
- **Traceable releases.** Artifacts are signed, versioned and published with checksums.
- **Fail closed.** Clients reject manifests that do not verify.

Internet off. Work continues.

## Repository layout

```
release/
├── README.md
├── installer/
│   ├── README.md
│   └── model-registry.json
├── binaries/
│   ├── macos/
│   ├── linux/
│   └── windows/
├── releases/
│   └── README.md
├── docs/
│   └── distribution-model.md
└── .github/
    └── workflows/
```

## Release channel

The v1 release channel is **`stable`**.

Everything in `stable` is signed, versioned and published with checksums. Future channels such as `beta` or `nightly` will only be added when they create clear customer value.

## Security model

| Artifact                        | Protection               | Purpose                             |
| ------------------------------- | ------------------------ | ----------------------------------- |
| `installer/model-registry.json` | Ed25519 signature        | Verifies available local AI models  |
| macOS binaries                  | Apple Developer ID       | Gatekeeper-compatible installation  |
| Windows binaries                | Code-signing certificate | SmartScreen-compatible installation |
| Release files                   | Checksums                | Traceable integrity per version     |

## Product principles

- **Data stays with you.** Release infrastructure distributes software; confidential customer data stays in the customer's network.
- **Runs in your infrastructure.** Igdrsil is not a hosted AI service behind the scenes.
- **Built for confidential routines.** Updates and installs should be understandable without making developer tools the normal path.
- **Craft over shortcuts.** Unsigned or unverifiable artifacts do not belong in a public release.

## See also

- [`installer/README.md`](installer/README.md) — manifest and signature details
- [`docs/distribution-model.md`](docs/distribution-model.md) — distribution model and trust boundaries
- [`releases/README.md`](releases/README.md) — release-notes format
