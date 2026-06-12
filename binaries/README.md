# Igdrsil — Release Binaries

Per-platform release binaries (signed `.dmg`, `.AppImage`, `.msi` etc.)
get committed here for provenance after they ship to a tagged release.

## What does and doesn't get committed

**Committed:**
- Final, signed, notarized binaries for each tagged release
- Filename pattern: `igdrsil-<platform>-<arch>-<version>.<ext>`
  (e.g., `igdrsil-macos-arm64-v1.0.0.dmg`)
- Their SHA-256 checksums in the matching `releases/v*/CHECKSUMS.txt`

**Not committed:**
- Unsigned binaries (don't ship at all — customer-visible signing
  warnings violate democratisation per OQ-036)
- Debug / staging builds (live under `staging/` per `.gitignore`)
- Per-developer ad-hoc builds

## Why commit binaries to git at all

Two reasons:

1. **Provenance.** If a customer asks "is the binary I have the same
   one you released?" — a `git log` + `sha256sum` comparison answers
   it definitively. Without an in-repo copy we'd be answering from
   GitHub Releases alone, which is fine until GitHub has an outage
   or a backdated edit.

2. **Disaster recovery.** If the GitHub Release is ever lost, we
   re-publish from this directory.

## Why this is acceptable size-wise

Igdrsil binaries are O(50–150 MB) each. Three platforms × N versions
adds up over time. Two mitigations:

1. We keep only the last 3 stable versions + every major version.
   Older versions get archived to S3 / Backblaze (one-time pull on
   demand, not on every clone).
2. Git LFS may be considered for `binaries/` if size becomes a
   problem. Not v1; revisit at v1.0.5.

## Layout

```
binaries/
├── macos/
│   ├── igdrsil-macos-arm64-v1.0.0.dmg
│   ├── igdrsil-macos-amd64-v1.0.0.dmg
│   └── ...
├── linux/
│   ├── igdrsil-linux-amd64-v1.0.0.AppImage
│   └── ...
└── windows/
    ├── igdrsil-windows-amd64-v1.0.0.msi
    └── ...
```

## See also

- `../installer/README.md` — manifest upload (lighter-weight, separate)
- `../docs/distribution-model.md` — Option B distribution decision
- `../releases/README.md` — release-notes + checksums format
