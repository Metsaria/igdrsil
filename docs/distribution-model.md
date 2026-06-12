# Distribution Model — Locked

**Date locked:** 2026-06-12
**Decision route:** Founder verdict on OQ (cofounder synthesis)
**Founder words (verbatim):** *"option B we are following our values no shortcuts"*

## What this document is

The locked decision on **how Igdrsil ships from the build machine to the
customer's box.** Future contributors who consider routing artefacts
through `raw.githubusercontent.com`, "branch-based channels," or any
other shortcut should read this first.

## The decision

Igdrsil v1 ships via **GitHub Releases on `Metsaria/igdrsil`** with a
single channel named `stable`.

Each release is a **tagged release on the repo**, not a file on a
branch. Customers fetch artefacts from release-asset URLs of the form:

```
https://github.com/Metsaria/igdrsil/releases/download/<tag>/<asset>
```

The `<tag>` for v1 is `stable`. Future channels (`beta`, `nightly`,
explicit version tags like `v1.0.0`) reuse the same shape with
different tag names.

## What this preserves

Three properties that the architect locked in OQ-027 closure
(plan/PROJECT-STATE.md, 2026-06-11):

1. **Atomic versioning.** Tagging a release pins all assets to that
   version simultaneously. We can never have a half-rolled-out manifest
   pointing at binaries that haven't been signed yet, or a binary
   pointing at a manifest with a different model list.

2. **Rollback path.** If `stable` ships a broken artefact, we move the
   `stable` tag to a previous commit. Clients re-fetching get the old
   artefact. No customer is left holding a partially-broken state.
   Branch-based distribution (Option A) breaks this — every push
   immediately mutates what customers fetch, with no rollback handle.

3. **Trust on tagging, not branch HEAD.** The release-signing pipeline
   (per `plan/PRERELEASE-STEPS.md` item 2) verifies signatures at the
   tag, not at branch HEAD. Branch-pushed artefacts can drift
   silently; tag-published artefacts cannot.

## What was rejected and why

**Option A — `raw.githubusercontent.com` subfolder fetch.**

```
https://raw.githubusercontent.com/Metsaria/igdrsil/main/installer/model-registry.json
```

Pros (claimed): simpler, no release-tagging step, instant updates on push.

Why rejected:
- "Instant updates on push" is not a feature, it's a footgun. A bad
  commit on `main` immediately breaks every customer's installer.
- No rollback semantics. Reverting the commit fixes the future, but
  any client mid-fetch during the bad window saw the bad file.
- Loses the "stable channel" abstraction. We'd have to invent it back
  with branch protection, signed-commit gates, and ad-hoc tooling —
  rebuilding what Releases gives us for free.
- Architect §11.3 in WP-INSTALLER explicitly named the release-channel
  shape; deviating without a real reason is shortcut culture.

**Option C — sandbox + `/usr/local/bin/` install (rejected earlier
in OQ-036).**

This is a related decision documented separately. The sandbox-OFF
posture pairs with Developer-ID + notarized binaries — both consistent
with the GitHub-Releases distribution path here.

## Trust model end-to-end

```
                    ┌───────────────────────────────────────────────┐
                    │  Founder's box (or v1.1+ CI)                  │
                    │                                                │
                    │  1. Build artefact (manifest / binary)         │
                    │  2. Sign with Ed25519 / Apple Dev ID / EV cert │
                    │  3. Verify signature locally                   │
                    └─────────────────┬─────────────────────────────┘
                                      │
                                      │  git push + gh release upload
                                      ▼
                    ┌───────────────────────────────────────────────┐
                    │  github.com/Metsaria/igdrsil/releases/stable  │
                    │                                                │
                    │  ASSETS: model-registry.json,                  │
                    │          igdrsil-macos-arm64.dmg, ...          │
                    └─────────────────┬─────────────────────────────┘
                                      │
                                      │  HTTPS GET (single egress)
                                      ▼
                    ┌───────────────────────────────────────────────┐
                    │  Customer's box — Igdrsil installer            │
                    │                                                │
                    │  1. Fetch artefact from pinned release URL    │
                    │  2. Verify signature against pinned pub key   │
                    │  3. Fail-closed on any verification failure   │
                    └───────────────────────────────────────────────┘
```

The pinned pub key + pinned URL together form the trust anchor. A
compromise of the GitHub repo alone is **not sufficient** to ship a
malicious manifest — the attacker would also need the Ed25519 priv
key (Q26 vault custody) or the Developer ID / EV cert.

## What would force re-evaluation

This decision should be revisited only if:

- GitHub deprecates Releases or changes the release-asset URL shape
  (vanishingly unlikely)
- We introduce a true offline / air-gapped distribution mode (deferred
  to v1.6 per OQ-027 Q1)
- The release-signing pipeline (`plan/PRERELEASE-STEPS.md` item 2)
  is established and chooses a different artefact host

Until then: **GitHub Releases. Tagged. Signed. No shortcuts.**

## See also

- `../README.md` — repo-top-level structure
- `../installer/README.md` — manifest-specific upload runbook
- `plan/PRERELEASE-STEPS.md` — cert procurement + CI/CD establishment
  (the founder-action queue for v1.1+ release pipeline)
- `plan/PROJECT-STATE.md` §5 OQ-027 closure (2026-06-11) — the
  original architect ruling on the channel-shape
- `plan/strategy.md` — the values this decision concretises
