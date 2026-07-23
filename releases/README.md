# Igdrsil — Release Notes

This directory holds **per-version release notes and checksums** for
each tagged Igdrsil release.

## Layout (planned, will populate as releases ship)

```
releases/
├── README.md                ← you are here
├── stable/                  ← always-current pointer; rolling notes
│   └── RELEASE-NOTES.md
├── v1.0.0/                  ← per-version, immutable once tagged
│   ├── RELEASE-NOTES.md
│   ├── CHECKSUMS.txt        ← sha256 of every binary in this release
│   └── CHECKSUMS.txt.sig    ← Ed25519 signature of CHECKSUMS.txt
├── v1.0.1/
└── ...
```

## Format of `RELEASE-NOTES.md`

Three sections, in this order:

1. **What changed** — bullet list of user-visible changes, plain
   language. No internal IDs, no commit shas.
2. **Migration notes** — anything a customer must do when upgrading
   from the previous version. Empty if no action needed.
3. **Known issues** — open bugs the customer might hit. Empty if no
   known issues. Honesty is non-negotiable here per craftsmanship.

## Format of `CHECKSUMS.txt`

One line per binary, in the format:

```
<sha256 hex>  <filename>
```

Same format `sha256sum -c` consumes. Customers can verify integrity
against either the pinned binary signature OR by comparing the SHA
in CHECKSUMS.txt — defense in depth.

`CHECKSUMS.txt.sig` is the Ed25519 signature of `CHECKSUMS.txt` made
with the same release key that signs the model-registry manifest. A
customer who trusts the manifest can transitively trust the checksums.

## Lifecycle

- A release directory is **immutable once tagged.** If we discover a
  bug post-release, we ship `v1.0.1`, not "edit v1.0.0 retroactively."
- The `stable/` symlink (or rolling-pointer file) always points at
  the version currently published as `stable` on GitHub Releases.

## v1.0.0 ship-readiness checklist

Per `plan/PRERELEASE-STEPS.md` item 3, v1 ships when:

1. Foundation commit + WP-CSAPI-1 next-slice + WP-S3-C-PIVOT all green
2. Sandbox-OFF entitlements signed with Apple Developer ID + notarized
3. Windows EV cert procured + MSIX signed
4. Phase B re-run baseline locked against Option E embedded CSAPI stack
5. Manifest published to `stable` release with verified-correct Qwen3
   tags (post-OQ-038 benchmark)
6. First Kanzlei dogfood install passes the 30-second cold-boot test
   ("Was ist Igdrsil?" → grounded answer)

When all six green, the v1.0.0 release notes get written and the
tag gets cut.
